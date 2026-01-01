// Controller xử lý message từ chatbot.
// Sử dụng intentRecognizer để detect intent, AI cho generative, DB queries cho data.
// Ghi chú: Switch cho 50 intents, mỗi case query DB phù hợp (sử dụng poolPromise hiện có).
// Nếu intent generative, dùng generateWithAI. Add ML cho recs.
// Mỗi intent có comment giải thích: Mô tả tính năng, query DB dùng, và cách xử lý response.

const { poolPromise } = require('../db');  // Kết nối DB MSSQL từ file hiện có của dự án
const { recognizeIntent } = require('../utils/intentRecognizer');  // Nhận diện intent và entities từ message
const { generateWithAI } = require('../utils/aiProviders');  // Generative AI với 10 providers fallback
const { getRecommendations } = require('../utils/mlRecommendations');  // Gợi ý ML dựa trên user orders

// Hàm chính xử lý request từ route /api/chatbot
// Input: req.body { message, userId }
// Output: res.json { reply }
// Giải thích: Lấy pool DB, recognize intent, handle intent để tạo reply, catch error gửi response lỗi
exports.processMessage = async (req, res) => {
  const { message, userId = 1 } = req.body;  // userId mặc định nếu không có auth

  if (!message) return res.status(400).json({ reply: 'Vui lòng nhập tin nhắn!' });

  try {
    const pool = await poolPromise;
    const { intent, entities } = recognizeIntent(message);
    let reply = await handleIntent(intent, entities, pool, userId, message);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Lỗi server, thử lại sau!' });
  }
};

// Hàm xử lý chính theo intent
// Input: intent (string), entities (object), pool (DB pool), userId (int), message (string)
// Output: string reply
// Giải thích: Switch case cho 50 intents, mỗi case query DB tương ứng, format response. Default fallback AI.
async function handleIntent(intent, entities, pool, userId, message) {
  let result;
  switch (intent) {
    // Intent 1: Tìm sản phẩm theo tên
    // Query: SELECT TOP 5 từ Products WHERE ProductName LIKE term
    // Response: Danh sách sản phẩm với tên, giá, hình
    case 'search_product_name':
      result = await pool.request().input('name', `%${entities.product || message}%`).query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products WHERE ProductName LIKE @name');
      return formatProducts(result.recordset);

    // Intent 2: Tìm sản phẩm theo danh mục
    // Query: SELECT TOP 5 từ Products WHERE CategoryID IN (SELECT từ Categories WHERE CategoryName LIKE term)
    // Response: Danh sách sản phẩm trong danh mục
    case 'search_by_category':
      result = await pool.request().input('cat', `%${entities.category || message}%`).query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products WHERE CategoryID IN (SELECT CategoryID FROM Categories WHERE CategoryName LIKE @cat)');
      return formatProducts(result.recordset);

    // Intent 3: Tìm sản phẩm theo khoảng giá
    // Query: SELECT TOP 5 từ Products WHERE Price BETWEEN min AND max
    // Response: Danh sách sản phẩm trong range giá
    case 'search_by_price':
      result = await pool.request().input('min', entities.priceMin || 0).input('max', entities.priceMax || 9999999).query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products WHERE Price BETWEEN @min AND @max');
      return formatProducts(result.recordset);

    // Intent 4: Tìm sản phẩm mới nhất
    // Query: SELECT TOP 5 từ Products ORDER BY CreatedAt DESC
    // Response: Danh sách sản phẩm mới
    case 'search_new_products':
      result = await pool.request().query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products ORDER BY CreatedAt DESC');
      return formatProducts(result.recordset);

    // Intent 5: Tìm sản phẩm bán chạy (dựa trên số lượng order)
    // Query: SELECT TOP 5 từ Products JOIN OrderDetails GROUP BY ProductID ORDER BY SUM(Quantity) DESC
    // Response: Danh sách sản phẩm hot
    case 'search_hot_products':
      result = await pool.request().query('SELECT TOP 5 p.ProductID, p.ProductName, p.Price, p.ImageURL FROM Products p JOIN OrderDetails od ON p.ProductID = od.ProductID GROUP BY p.ProductID, p.ProductName, p.Price, p.ImageURL ORDER BY SUM(od.Quantity) DESC');
      return formatProducts(result.recordset);

    // Intent 6: Tìm sản phẩm theo mô tả
    // Query: SELECT TOP 5 từ Products WHERE Descriptions LIKE term
    // Response: Danh sách sản phẩm khớp mô tả
    case 'search_by_desc':
      result = await pool.request().input('desc', `%${message}%`).query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products WHERE Descriptions LIKE @desc');
      return formatProducts(result.recordset);

    // Intent 7: Sắp xếp sản phẩm giá tăng dần
    // Query: SELECT TOP 5 từ Products ORDER BY Price ASC
    // Response: Danh sách sản phẩm giá thấp đến cao
    case 'sort_by_price_asc':
      result = await pool.request().query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products ORDER BY Price ASC');
      return formatProducts(result.recordset);

    // Intent 8: Sắp xếp sản phẩm giá giảm dần
    // Query: SELECT TOP 5 từ Products ORDER BY Price DESC
    // Response: Danh sách sản phẩm giá cao đến thấp
    case 'sort_by_price_desc':
      result = await pool.request().query('SELECT TOP 5 ProductID, ProductName, Price, ImageURL FROM Products ORDER BY Price DESC');
      return formatProducts(result.recordset);

    // Intent 9: Phân trang sản phẩm
    // Query: SELECT từ Products OFFSET (page-1)*5 ROWS FETCH NEXT 5 ROWS ONLY
    // Response: Danh sách sản phẩm trang hiện tại
    case 'paginate_products':
      const offset = (entities.page - 1) * 5;
      result = await pool.request().input('offset', offset).query('SELECT ProductID, ProductName, Price, ImageURL FROM Products ORDER BY ProductID OFFSET @offset ROWS FETCH NEXT 5 ROWS ONLY');
      return formatProducts(result.recordset);

    // Intent 10: So sánh sản phẩm
    // Query: SELECT từ Products WHERE ProductID IN (id1, id2)
    // Response: So sánh giá, mô tả giữa 2 sản phẩm (giả sử entities có 2 product IDs)
    case 'compare_products':
      result = await pool.request().query('SELECT ProductName, Price, Descriptions FROM Products WHERE ProductID IN (1, 2)');  // Thay bằng entities
      return result.recordset.map(p => `${p.ProductName}: ${p.Price}₫ - ${p.Descriptions}`).join('\nVs\n');

    // Intent 11: Theo dõi đơn hàng
    // Query: SELECT từ Orders WHERE OrderID = id AND UserID = userId
    // Response: Status, total, date của đơn
    case 'track_order':
      result = await pool.request().input('id', entities.orderId).input('userId', userId).query('SELECT Status, TotalAmount, OrderDate FROM Orders WHERE OrderID = @id AND UserID = @userId');
      return result.recordset[0] ? `Status: ${result.recordset[0].Status}, Tổng: ${result.recordset[0].TotalAmount}₫, Ngày: ${result.recordset[0].OrderDate}` : 'Không tìm thấy';

    // Intent 12: Liệt kê đơn hàng của user
    // Query: SELECT TOP 5 từ Orders WHERE UserID = userId
    // Response: Danh sách OrderID, status, total
    case 'list_orders':
      result = await pool.request().input('userId', userId).query('SELECT TOP 5 OrderID, Status, TotalAmount FROM Orders WHERE UserID = @userId');
      return formatOrders(result.recordset);

    // Intent 13: Kiểm tra trạng thái đơn hàng
    // Query: SELECT Status từ Orders WHERE OrderID = id
    // Response: Trạng thái đơn (Pending, Shipped, etc.)
    case 'order_status':
      result = await pool.request().input('id', entities.orderId).query('SELECT Status FROM Orders WHERE OrderID = @id');
      return result.recordset[0] ? `Trạng thái: ${result.recordset[0].Status}` : 'Không tìm thấy';

    // Intent 14: Tính tổng tiền đơn hàng
    // Query: SELECT TotalAmount từ Orders WHERE OrderID = id
    // Response: Tổng tiền đơn
    case 'order_total':
      result = await pool.request().input('id', entities.orderId).query('SELECT TotalAmount FROM Orders WHERE OrderID = @id');
      return result.recordset[0] ? `Tổng: ${result.recordset[0].TotalAmount}₫` : 'Không tìm thấy';

    // Intent 15: Kiểm tra phương thức thanh toán
    // Query: SELECT PaymentMethod từ Orders WHERE OrderID = id
    // Response: Phương thức (COD, Card, etc.)
    case 'payment_method':
      result = await pool.request().input('id', entities.orderId).query('SELECT PaymentMethod FROM Orders WHERE OrderID = @id');
      return result.recordset[0] ? `Phương thức: ${result.recordset[0].PaymentMethod}` : 'Không tìm thấy';

    // Intent 16: Xem ghi chú đơn hàng
    // Query: SELECT OrderNotes từ Orders WHERE OrderID = id
    // Response: Ghi chú đơn
    case 'order_notes':
      result = await pool.request().input('id', entities.orderId).query('SELECT OrderNotes FROM Orders WHERE OrderID = @id');
      return result.recordset[0] ? `Ghi chú: ${result.recordset[0].OrderNotes}` : 'Không có ghi chú';

    // Intent 17: Áp voucher cho đơn
    // Query: UPDATE Orders SET VoucherCode = code WHERE OrderID = id (simulate)
    // Response: Voucher áp dụng thành công (giả lập giảm giá)
    case 'apply_voucher':
      await pool.request().input('id', entities.orderId).input('code', message).query('UPDATE Orders SET VoucherCode = @code WHERE OrderID = @id');
      return 'Voucher áp dụng thành công! Giảm 10%';

    // Intent 18: Tìm đơn hàng theo ngày
    // Query: SELECT từ Orders WHERE OrderDate BETWEEN start AND end
    // Response: Danh sách đơn trong khoảng ngày
    case 'order_by_date':
      result = await pool.request().input('start', '2023-01-01').input('end', '2026-01-01').query('SELECT OrderID, Status FROM Orders WHERE OrderDate BETWEEN @start AND @end');
      return formatOrders(result.recordset);

    // Intent 19: Hủy đơn hàng
    // Query: UPDATE Orders SET Status = 'Cancelled' WHERE OrderID = id
    // Response: Đơn hủy thành công (simulate)
    case 'cancel_order':
      await pool.request().input('id', entities.orderId).query('UPDATE Orders SET Status = \'Cancelled\' WHERE OrderID = @id');
      return 'Đơn hàng đã hủy!';

    // Intent 20: Cập nhật đơn hàng
    // Query: UPDATE Orders SET OrderNotes = newNote WHERE OrderID = id
    // Response: Cập nhật thành công
    case 'update_order':
      await pool.request().input('id', entities.orderId).input('note', message).query('UPDATE Orders SET OrderNotes = @note WHERE OrderID = @id');
      return 'Cập nhật đơn thành công!';

    // Intent 21: Liệt kê đánh giá
    // Query: SELECT TOP 5 từ Reviews
    // Response: Danh sách rating, comment
    case 'list_reviews':
      result = await pool.request().query('SELECT TOP 5 ReviewID, Rating, Comment FROM Reviews');
      return formatReviews(result.recordset);

    // Intent 22: Thêm đánh giá
    // Query: INSERT INTO Reviews (OrderID, ProductID, UserID, Rating, Comment)
    // Response: Đánh giá thêm thành công (giả lập từ message)
    case 'add_review':
      await pool.request().input('orderId', 1).input('productId', 1).input('userId', userId).input('rating', 5).input('comment', message).query('INSERT INTO Reviews (OrderID, ProductID, UserID, Rating, Comment) VALUES (@orderId, @productId, @userId, @rating, @comment)');
      return 'Đánh giá đã thêm!';

    // Intent 23: Đánh giá theo sản phẩm
    // Query: SELECT từ Reviews WHERE ProductID = id
    // Response: Danh sách đánh giá cho sản phẩm
    case 'reviews_by_product':
      result = await pool.request().input('id', entities.product || 1).query('SELECT Rating, Comment FROM Reviews WHERE ProductID = @id');
      return formatReviews(result.recordset);

    // Intent 24: Điểm trung bình đánh giá
    // Query: SELECT AVG(Rating) FROM Reviews WHERE ProductID = id
    // Response: Điểm TB
    case 'average_rating':
      result = await pool.request().input('id', entities.product || 1).query('SELECT AVG(Rating) AS AvgRating FROM Reviews WHERE ProductID = @id');
      return `Điểm TB: ${result.recordset[0].AvgRating}`;

    // Intent 25: Sản phẩm có đánh giá cao
    // Query: SELECT TOP 5 từ Products JOIN (SELECT ProductID, AVG(Rating) GROUP BY) ORDER BY Avg DESC
    // Response: Danh sách sản phẩm top rating
    case 'high_rating_products':
      result = await pool.request().query('SELECT TOP 5 p.ProductName, AVG(r.Rating) AS Avg FROM Products p JOIN Reviews r ON p.ProductID = r.ProductID GROUP BY p.ProductName ORDER BY Avg DESC');
      return formatProducts(result.recordset);

    // Intent 26: Đánh giá mới nhất
    // Query: SELECT TOP 5 từ Reviews ORDER BY CreatedAt DESC
    // Response: Danh sách đánh giá gần đây
    case 'recent_reviews':
      result = await pool.request().query('SELECT TOP 5 Rating, Comment FROM Reviews ORDER BY CreatedAt DESC');
      return formatReviews(result.recordset);

    // Intent 27: Đánh giá có hình ảnh
    // Query: SELECT từ Reviews WHERE ImageURL IS NOT NULL
    // Response: Danh sách đánh giá với hình
    case 'review_with_image':
      result = await pool.request().query('SELECT TOP 5 Rating, Comment, ImageURL FROM Reviews WHERE ImageURL IS NOT NULL');
      return formatReviews(result.recordset);

    // Intent 28: Xóa đánh giá (admin only)
    // Query: DELETE FROM Reviews WHERE ReviewID = id
    // Response: Xóa thành công
    case 'delete_review':
      await pool.request().input('id', entities.reviewId || 1).query('DELETE FROM Reviews WHERE ReviewID = @id');
      return 'Đánh giá đã xóa!';

    // Intent 29: Sửa đánh giá
    // Query: UPDATE Reviews SET Comment = new WHERE ReviewID = id
    // Response: Sửa thành công
    case 'edit_review':
      await pool.request().input('id', entities.reviewId || 1).input('comment', message).query('UPDATE Reviews SET Comment = @comment WHERE ReviewID = @id');
      return 'Đánh giá đã sửa!';

    // Intent 30: Lọc đánh giá (ví dụ theo rating > 4)
    // Query: SELECT từ Reviews WHERE Rating > 4
    // Response: Danh sách đánh giá cao
    case 'filter_reviews':
      result = await pool.request().query('SELECT TOP 5 Rating, Comment FROM Reviews WHERE Rating > 4');
      return formatReviews(result.recordset);

    // Intent 31: Đăng ký newsletter
    // Query: INSERT INTO Newsletter (Email)
    // Response: Đăng ký thành công
    case 'subscribe_newsletter':
      const email = message.match(/[\w.-]+@[\w.-]+/) ? message.match(/[\w.-]+@[\w.-]+/)[0] : 'test@email.com';
      await pool.request().input('email', email).query('INSERT INTO Newsletter (Email) VALUES (@email)');
      return 'Đăng ký nhận tin thành công! 📩';

    // Intent 32: Kiểm tra đăng ký newsletter
    // Query: SELECT FROM Newsletter WHERE Email = email
    // Response: Đã đăng ký hay chưa
    case 'check_subscription':
      result = await pool.request().input('email', message).query('SELECT ID FROM Newsletter WHERE Email = @email');
      return result.recordset.length > 0 ? 'Bạn đã đăng ký!' : 'Chưa đăng ký';

    // Intent 33: Hủy đăng ký newsletter
    // Query: DELETE FROM Newsletter WHERE Email = email
    // Response: Hủy thành công
    case 'unsubscribe':
      await pool.request().input('email', message).query('DELETE FROM Newsletter WHERE Email = @email');
      return 'Hủy đăng ký thành công!';

    // Intent 34: Liệt kê subscribers (admin)
    // Query: SELECT TOP 5 FROM Newsletter
    // Response: Danh sách email
    case 'list_subscribers':
      result = await pool.request().query('SELECT TOP 5 Email FROM Newsletter');
      return result.recordset.map(e => e.Email).join('\n');

    // Intent 35: Gửi newsletter (simulate admin)
    // Query: No query, simulate
    // Response: Gửi thành công (giả lập)
    case 'send_newsletter':
      return 'Newsletter đã gửi đến tất cả subscribers!';

    // Intent 36: Số lượng subscribers
    // Query: SELECT COUNT(*) FROM Newsletter
    // Response: Số lượng
    case 'newsletter_count':
      result = await pool.request().query('SELECT COUNT(*) AS Count FROM Newsletter');
      return `Số lượng: ${result.recordset[0].Count}`;

    // Intent 37: Subscribers mới nhất
    // Query: SELECT TOP 5 FROM Newsletter ORDER BY CreatedAt DESC
    // Response: Danh sách email mới
    case 'recent_subscribers':
      result = await pool.request().query('SELECT TOP 5 Email FROM Newsletter ORDER BY CreatedAt DESC');
      return result.recordset.map(e => e.Email).join('\n');

    // Intent 38: Xuất danh sách newsletter
    // Query: SELECT ALL FROM Newsletter
    // Response: Danh sách đầy đủ (simulate export)
    case 'export_newsletter':
      result = await pool.request().query('SELECT Email FROM Newsletter');
      return 'Export: ' + result.recordset.map(e => e.Email).join(',');

    // Intent 39: Lọc newsletter (ví dụ theo domain)
    // Query: SELECT FROM Newsletter WHERE Email LIKE '%@gmail.com'
    // Response: Danh sách lọc
    case 'filter_newsletter':
      result = await pool.request().query('SELECT Email FROM Newsletter WHERE Email LIKE \'%@gmail.com\'');
      return result.recordset.map(e => e.Email).join('\n');

    // Intent 40: Xác thực email newsletter
    // Query: UPDATE Newsletter SET Verified = 1 WHERE Email = email (thêm column nếu cần, simulate)
    // Response: Xác thực thành công
    case 'verify_email':
      return 'Email đã xác thực!';

    // Intent 41: Xem hồ sơ user
    // Query: SELECT FROM Users WHERE UserID = userId
    // Response: Tên, email, address
    case 'user_profile':
      result = await pool.request().input('id', userId).query('SELECT FullName, Email, Address FROM Users WHERE UserID = @id');
      return result.recordset[0] ? `Tên: ${result.recordset[0].FullName}, Email: ${result.recordset[0].Email}, Địa chỉ: ${result.recordset[0].Address}` : 'Không tìm thấy';

    // Intent 42: Cập nhật địa chỉ user
    // Query: UPDATE Users SET Address = new WHERE UserID = userId
    // Response: Cập nhật thành công
    case 'update_address':
      await pool.request().input('id', userId).input('addr', message).query('UPDATE Users SET Address = @addr WHERE UserID = @id');
      return 'Địa chỉ cập nhật thành công!';

    // Intent 43: Kiểm tra tài khoản verified
    // Query: SELECT IsVerified FROM Users WHERE UserID = userId
    // Response: Đã xác thực hay chưa
    case 'check_verified':
      result = await pool.request().input('id', userId).query('SELECT IsVerified FROM Users WHERE UserID = @id');
      return result.recordset[0].IsVerified ? 'Tài khoản đã xác thực' : 'Chưa xác thực';

    // Intent 44: Reset mật khẩu (simulate)
    // Query: No query, simulate gửi email
    // Response: Link reset gửi đến email
    case 'reset_password':
      return 'Link reset mật khẩu đã gửi đến email!';

    // Intent 45: Liệt kê users (admin)
    // Query: SELECT TOP 5 FROM Users
    // Response: Danh sách user
    case 'admin_list_users':
      result = await pool.request().query('SELECT TOP 5 FullName, Email FROM Users');
      return result.recordset.map(u => `${u.FullName} - ${u.Email}`).join('\n');

    // Intent 46: Gợi ý sản phẩm
    // Query: Từ mlRecommendations
    // Response: Danh sách gợi ý dựa lịch sử
    case 'recommend_products':
      const recs = await getRecommendations(userId);
      return `Gợi ý cho bạn: ${recs.join(', ')}`;

    // Intent 47: Gợi ý phối đồ
    // Query: Use AI generate based on season/category
    // Response: Text phối đồ từ AI
    case 'outfit_suggestions':
      return await generateWithAI(`Gợi ý phối đồ theo mùa từ sản phẩm 160store: ${message}`);

    // Intent 48: Tạo mô tả sản phẩm
    // Query: Use AI generate
    // Response: Mô tả mới từ AI
    case 'generate_desc':
      return await generateWithAI(`Tạo mô tả sản phẩm mới cho: ${message}`);

    // Intent 49: So sánh giá sản phẩm
    // Query: SELECT Price FROM Products WHERE ProductID IN (id1, id2)
    // Response: Giá so sánh
    case 'compare_prices':
      result = await pool.request().query('SELECT ProductName, Price FROM Products WHERE ProductID IN (1, 2)');
      return result.recordset.map(p => `${p.ProductName}: ${p.Price}₫`).join(' vs ');

    // Intent 50: Chat fallback bất kỳ
    // Query: No DB, use AI
    // Response: Trả lời generative từ AI
    case 'fallback_chat':
      return await generateWithAI(message);

    default:
      return await generateWithAI(message);  // Fallback cuối cùng
  }
}

// Helper: Format danh sách products
// Input: array recordset
// Output: string formatted
// Giải thích: Chuyển array thành string với tên - giá mỗi dòng
function formatProducts(products) {
  if (products.length === 0) return 'Không tìm thấy sản phẩm!';
  return products.map(p => `${p.ProductName} - ${p.Price}₫ (ID: ${p.ProductID})`).join('\n');
}

// Helper: Format danh sách orders
// Input: array recordset
// Output: string formatted
// Giải thích: Chuyển array thành string với ID - status - total mỗi dòng
function formatOrders(orders) {
  if (orders.length === 0) return 'Không có đơn hàng!';
  return orders.map(o => `ID: ${o.OrderID} - Status: ${o.Status} - Tổng: ${o.TotalAmount}₫`).join('\n');
}

// Helper: Format danh sách reviews
// Input: array recordset
// Output: string formatted
// Giải thích: Chuyển array thành string với rating - comment mỗi dòng
function formatReviews(reviews) {
  if (reviews.length === 0) return 'Không có đánh giá!';
  return reviews.map(r => `Rating: ${r.Rating}/5 - ${r.Comment}`).join('\n');
}