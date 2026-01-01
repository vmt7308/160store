// Utils để nhận diện intent từ message (thay thế spaCy Python).
// Sử dụng natural cho tokenization, keyword matching cho 50 intents.
// Ghi chú: Mở rộng keywords cho tiếng Việt/Anh. Extract entities như product name, order ID.

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const intentKeywords = {
    // 1-10: Search products
    search_product_name: ['tìm sản phẩm', 'search product', 'áo', 'quần', 'polo'],  // 1
    search_by_category: ['danh mục', 'category', 'hàng mới', 'bán chạy'],  // 2
    search_by_price: ['giá', 'price', 'dưới', 'trên', 'range'],  // 3
    search_new_products: ['hàng mới', 'new arrivals'],  // 4
    search_hot_products: ['bán chạy', 'hot items'],  // 5
    search_by_desc: ['mô tả', 'description', 'thoáng khí', 'mềm mại'],  // 6
    sort_by_price_asc: ['giá tăng dần', 'sort low to high'],  // 7
    sort_by_price_desc: ['giá giảm dần', 'sort high to low'],  // 8
    paginate_products: ['trang', 'page', 'next page'],  // 9
    compare_products: ['so sánh', 'compare'],  // 10

    // 11-20: Orders
    track_order: ['theo dõi đơn', 'track order', 'status'],  // 11
    list_orders: ['danh sách đơn', 'my orders'],  // 12
    order_status: ['trạng thái đơn', 'order status'],  // 13
    order_total: ['tổng tiền', 'total amount'],  // 14
    payment_method: ['phương thức thanh toán', 'payment'],  // 15
    order_notes: ['ghi chú đơn', 'notes'],  // 16
    apply_voucher: ['áp voucher', 'discount code'],  // 17
    order_by_date: ['đơn theo ngày', 'orders by date'],  // 18
    cancel_order: ['hủy đơn', 'cancel order'],  // 19 (simulate)
    update_order: ['cập nhật đơn', 'update order'],  // 20

    // 21-30: Reviews
    list_reviews: ['đánh giá', 'reviews'],  // 21
    add_review: ['thêm đánh giá', 'add review'],  // 22
    reviews_by_product: ['đánh giá sản phẩm', 'product reviews'],  // 23
    average_rating: ['điểm trung bình', 'average rating'],  // 24
    high_rating_products: ['sản phẩm cao điểm', 'top rated'],  // 25
    recent_reviews: ['đánh giá mới', 'recent reviews'],  // 26
    review_with_image: ['đánh giá có ảnh', 'reviews with image'],  // 27
    delete_review: ['xóa đánh giá', 'delete review'],  // 28 (admin)
    edit_review: ['sửa đánh giá', 'edit review'],  // 29
    filter_reviews: ['lọc đánh giá', 'filter reviews'],  // 30

    // 31-40: Newsletter
    subscribe_newsletter: ['đăng ký nhận tin', 'subscribe'],  // 31
    check_subscription: ['kiểm tra đăng ký', 'check subscribe'],  // 32
    unsubscribe: ['hủy đăng ký', 'unsubscribe'],  // 33
    list_subscribers: ['danh sách nhận tin', 'subscribers'],  // 34 (admin)
    send_newsletter: ['gửi tin', 'send newsletter'],  // 35 (admin simulate)
    newsletter_count: ['số lượng đăng ký', 'subscriber count'],  // 36
    recent_subscribers: ['đăng ký mới', 'recent subs'],  // 37
    export_newsletter: ['xuất danh sách', 'export subs'],  // 38
    filter_newsletter: ['lọc email', 'filter newsletter'],  // 39
    verify_email: ['xác thực email', 'verify email'],  // 40

    // 41-50: User/Admin & Recommendations
    user_profile: ['hồ sơ', 'profile'],  // 41
    update_address: ['cập nhật địa chỉ', 'update address'],  // 42
    check_verified: ['xác thực tài khoản', 'verified'],  // 43
    reset_password: ['reset mật khẩu', 'forgot password'],  // 44 (simulate)
    admin_list_users: ['danh sách user', 'list users'],  // 45 (admin)
    recommend_products: ['gợi ý sản phẩm', 'recommend'],  // 46
    outfit_suggestions: ['phối đồ', 'outfit ideas'],  // 47 (theo mùa)
    generate_desc: ['tạo mô tả', 'generate description'],  // 48 (AI)
    compare_prices: ['so sánh giá', 'price compare'],  // 49
    fallback_chat: ['default']  // 50 (AI generative cho bất kỳ)
};

function recognizeIntent(message) {
    const lowerMsg = message.toLowerCase();
    const tokens = tokenizer.tokenize(lowerMsg);
    let intent = 'fallback_chat';
    const entities = { product: null, category: null, priceMin: null, priceMax: null, orderId: null, page: 1 };

    // Extract entities
    const priceMatch = lowerMsg.match(/(\d+) đến (\d+)/);
    if (priceMatch) {
        entities.priceMin = parseInt(priceMatch[1]);
        entities.priceMax = parseInt(priceMatch[2]);
    }
    const orderMatch = lowerMsg.match(/đơn hàng (\d+)/);
    if (orderMatch) entities.orderId = parseInt(orderMatch[1]);

    // Match intent
    for (const [key, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(k => lowerMsg.includes(k))) {
            intent = key;
            break;
        }
    }

    return { intent, entities };
}

module.exports = { recognizeIntent };