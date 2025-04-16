CREATE DATABASE [160storeDB];
GO

USE [160storeDB];
GO

-- Tạo bảng User (Khách hàng)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng Admin
CREATE TABLE Admins (
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng Danh mục sản phẩm
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE
);

-- Tạo bảng Sản phẩm
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE CASCADE,
    ProductName NVARCHAR(255) NOT NULL,
    ImageURL NVARCHAR(255),
    Price DECIMAL(10,2) NOT NULL,
    -- Color NVARCHAR(50),
    -- Size NVARCHAR(20),
    Descriptions NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng Đơn hàng
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    OrderDate DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending'
);

-- Tạo bảng Chi tiết đơn hàng
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID) ON DELETE CASCADE,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL
);

-- Tạo bảng Báo cáo thống kê doanh thu
-- CREATE VIEW RevenueReport AS
-- SELECT
-- 	FORMAT(OrderDate, 'yyyy-MM') AS Month,
-- 	SUM(TotalAmount) AS TotalRevenue
-- FROM Orders
-- GROUP BY FORMAT(OrderDate, 'yyyy-MM');

-- Thêm dữ liệu
INSERT INTO Categories (CategoryName) VALUES
(N'HÀNG MỚI MỖI NGÀY'), (N'HÀNG BÁN CHẠY'), (N'TỦ ĐỒ MÙA HÈ'), (N'COMBO MIX & MATCH');

INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Descriptions) VALUES
-- HÀNG MỚI MỖI NGÀY
(1, N'Áo Thun Nam ICONDENIM Atheltics Champion', 'uploads/product1.jpg', 349000, N'Vải cotton màu trắng kem êm tay, thoáng khí và thấm hút mồ hôi tốt'),
(1, N'Áo Polo Nam ICONDENIM Horizontal Stripped', 'uploads/product2.jpg', 419000, N'Chất vải thun cotton nổi bật với khả năng co dãn tốt tạo độ thoải mái cho người mặc'),
(1, N'Áo Thun Nam ICONDENIM Edge Striped', 'uploads/product3.jpg', 299000, N'Chất vải cotton mềm mại, thoáng khí và thấm hút tốt – cảm giác dễ chịu cả ngày dài khi diện'),
(1, N'Áo Sơmi Cuban Nam ICONDENIM Nomadic Dreams', 'uploads/product4.jpg', 380000, N'Sợi tổng hợp mang đến độ bền vượt trội, nhanh khô, ít nhăn nhàu và co rút sau nhiều lần giặt'),
(1, N'Áo Thun Nam ICONDENIM Orgnls Armlines', 'uploads/product5.jpg', 375000, N'Chất liệu cotton, mang lại cảm giác mềm mại, thoáng khí và khả năng thấm hút mồ hôi tốt'),
(1, N'Áo Thun Nam ICONDENIM Luminous', 'uploads/product6.jpg', 400000, N'Chiếc áo này được làm từ vải cotton dày dặn, mềm mại, mang đến cảm giác nhẹ nhàng và thoáng khí'),
(1, N'Áo Sơ Mi Nam Tay Ngắn ICONDENIM Orgnls', 'uploads/product7.jpg', 320000, N'Vải Oxford không chỉ bền chắc, giữ form tốt mà còn có khả năng thấm hút hiệu quả, mang lại sự thoải mái, thoáng mát khi mặc'),
(1, N'Áo Thun Nam Denim ICONDENIM Orgnls Light Blue Wash', 'uploads/product8.jpg', 410000, N'Chất liệu denim không chỉ bền bỉ mà còn mang đến cảm giác mềm mại, thoáng khí, dễ chịu ngay cả khi phải mặc cả ngày dài'),
(1, N'Áo Polo Nam Procool ICONDENIM Seam Sealing', 'uploads/product9.jpg', 380000, N'Chất liệu Polyamide đặc biệt siêu mát lạnh giúp cho người mặc vẫn thoải mái trong các hoạt động thường ngày'),
(1, N'Áo thun Nam ICONDENIM ft MARVEL ICON LOGO', 'uploads/product10.jpg', 390000, N'Áo thun ICONDENIM ft Marvel chính hãng sở hữu thiết kế ấn tượng với logo MARVEL và biểu tượng các siêu anh hùng được in phản quang nổi bật'),
(1, N'Áo Polo ICONDENIM Shade Flow', 'uploads/product11.jpg', 225000, N'Chất liệu Double Face - Interlock CVC mang lại sự mềm mại, thoáng khí và độ bền vượt trội'),
(1, N'Áo Thun Nam ICONDENIM Rattle Essence', 'uploads/product12.jpg', 329000, N'Khả năng thấm hút mồ hôi tốt của vải cotton giữ cho cơ thể luôn khô thoáng, đồng thời duy trì độ bền'),
(1, N'Áo Hoodie Nam ICONDENIM Orgnls Typography With Tape', 'uploads/product13.jpg', 489000, N'Chất liệu Nỉ không chỉ có độ bền cao, hạn chế xù lông, mà còn mang lại cảm giác mềm mại và ít nhăn'),
(1, N'Áo Sơ Mi Nam Bamboo ICONDENIM Vertical Stripe', 'uploads/product14.jpg', 390000, N'Vải có kết cấu mềm mại, thoáng khí, mang đến cảm giác nhẹ nhàng, dễ chịu khi mặc. Đặc biệt, khả năng kháng khuẩn tự nhiên giúp hạn chế mùi hôi'),
(1, N'Quần Jean Nam ICONDENIM Beige Basic Straight', 'uploads/product15.jpg', 549000, N'Denim không chỉ nổi bật với kết cấu dày dặn, chắc chắn giúp giữ form tốt mà còn có độ bền vượt trội, hạn chế mài mòn theo thời gian'),
(1, N'Thắt Lưng Nam ICONDENIM Urban Essential', 'uploads/product16.jpg', 399000, N'Thắt lưng được làm từ da tổng hợp cao cấp, mang đến sự kết hợp hoàn hảo giữa độ mềm dẻo và độ bền chắc'),
(1, N'Áo Thun Nam ICONDENIM Patterned heat-embossed ID', 'uploads/product17.jpg', 329000, N'Chất liệu cotton mềm mại tự nhiên và nhờ khả năng thấm hút mồ hôi tốt và thoáng khí, vải giúp duy trì sự khô ráo'),
(1, N'Áo Thun Nam ICONDENIM MARVEL Captain Sentinel Of Liberty', 'uploads/product18.jpg', 349000, N'Thiết kế không chỉ khắc họa dáng vẻ kiên cường của đội trưởng Mỹ, mà còn truyền tải tinh thần chính nghĩa và ý chí bất khuất, tạo điểm nhấn ấn tượng cho mọi outfit');

INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Descriptions) VALUES
-- HÀNG BÁN CHẠY
(2, N'Áo Polo Nam ICONDENIM Logo Mark', 'uploads/product19.jpg', 250000, N'Chất liệu Double Face Interlock CVC cá sấu với cấu trúc dệt đan kép hai lớp, chất liệu này không chỉ giúp giữ form áo tốt mà còn tăng khả năng co giãn linh hoạt, tạo sự thoải mái cho người mặc'),
(2, N'Quần Short Kaki Nam ICONDENIM Garment Dye', 'uploads/product20.jpg', 260000, N'Đây là kỹ thuật nhuộm màu sau khi sản phẩm đã được may hoàn chỉnh, giúp màu sắc thấm đều và tự nhiên'),
(2, N'Áo Sơ Mi Nam Cuban ICONDENIM ft MARVEL ART COMIC', 'uploads/product21.jpg', 270000, N'Thiết kế này nổi bật với họa tiết in tràn toàn bộ áo, tái hiện sống động nhiều bộ truyện tranh kinh điển của Marvel'),
(2, N'Quần Jogger Khakis Nam ICONDENIM Garment Dye', 'uploads/product22.jpg', 280000, N'Vải kaki dày dặn giúp quần lên form chuẩn, mang lại vẻ ngoài lịch lãm nhưng vẫn đảm bảo sự thoải mái khi mặc'),
(2, N'Áo Polo Nam ICONDENIM Classic Urban', 'uploads/product23.jpg', 265000, N'Chất liệu CVC cá sấu co giãn linh hoạt, mang đến sự thoải mái và dễ chịu khi vận động'),
(2, N'Áo Sơ Mi Nam ICONDENIM Mickey & Friends The Shades Form Boxy', 'uploads/product24.jpg', 275000, N'Với sự kết hợp giữa chất liệu tự nhiên và họa tiết sọc tinh tế, áo mang đậm phong cách Palewave'),
(2, N'Áo Sơ Mi Cuban Nam ICONDENIM Floral Threads', 'uploads/product25.jpg', 250000, N'Vải không chỉ mát mà còn dễ giặt, nhanh khô, ít nhăn, dễ dàng bảo quản giúp người mặc luôn thấy thoải mái, tự tin khi diện'),
(2, N'Áo Polo Nam ICONDENIM Monogram Pattern ID', 'uploads/product26.jpg', 290000, N'Chất vải CVC hai da độc đáo, bên ngoài cứng cáp, bên trong mềm mại. Một màu xanh navy chuẩn chỉnh, cực nam tính'),
(2, N'Áo Polo Nam ICONDENIM Pattern Vertical Stripes', 'uploads/product27.jpg', 300000, N'Chất liệu CVC cá sấu nổi bật với khả năng co giãn tuyệt vời, giúp thấm hút mồ hôi hiệu quả, giữ cơ thể luôn khô thoáng, mang lại cảm giác dễ chịu trong mọi hoạt động'),
(2, N'Áo Polo Nam ICONDENIM ELEGANCE', 'uploads/product28.jpg', 379000, N'Chất liệu Double Face - Interlock CVC sử dụng công nghệ dệt Interlock, tạo bề mặt vải dày dặn, có độ co giãn tốt và ít bị bai dão sau thời gian dài sử dụng'),
(2, N'Áo Polo Nam ICONDENIM Pattern 8386', 'uploads/product29.jpg', 399000, N'Công nghệ dệt Interlock tạo ra bề mặt vải mịn màng, co giãn linh hoạt hai chiều, ít nhăn, mang đến cảm giác thoải mái và dễ chịu khi tiếp xúc với da'),
(2, N'Áo Polo Nam ICONDENIM Elegant Stripe Collar', 'uploads/product30.jpg', 300000, N'Chất vải thấm hút mồ hôi hiệu quả, mang lại sự thoải mái trong mọi hoạt động, từ thường ngày đến công sở'),
(2, N'Áo Polo Nam ICONDENIM Sleeves Colors Mixed', 'uploads/product31.jpg', 349000, N'Áo với hai gam màu trắng và xanh đen, nổi bật với chi tiết dệt sọc ngang phối viền màu đỏ ở cổ cắt ngang thân áo tạo nên thiết kế thanh lịch nhưng không quá phô trương'),
(2, N'Áo Polo Nam ICONDENIM Orgnls', 'uploads/product32.jpg', 250000, N'Chất liệu Double Face Interlock CVC cá sấu với cấu trúc dệt đan kép hai lớp, chất liệu này không chỉ giúp giữ form áo tốt mà còn tăng khả năng co giãn linh hoạt'),
(2, N'Áo Polo Nam ICONDENIM Pattern Monogram IDOG', 'uploads/product33.jpg', 300000, N'Chiếc này không chỉ là lựa chọn hoàn hảo cho những buổi dạo phố mà còn là món đồ không thể thiếu cho những ai yêu thích thời trang');

INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Descriptions) VALUES
-- TỦ ĐỒ MÙA HÈ
(3, N'Áo Tanktop ICONDENIM Orgnls Logo', 'uploads/product34.jpg', 399000, N'Chất liệu thun cotton cực thoáng mát, mặc lên cực dễ chịu. Thiết kế bản vai to trẻ trung, năng động. Chi tiết in cao bền bỉ, không bong tróc'),
(3, N'Áo Thun Nam ICONDENIM ICDN Graffy', 'uploads/product35.jpg', 290000, N'Áo thun với chất liệu Cotton mềm mại, thông thoáng. Phong cách Graffity ấn tượng. Hình thêu nhỏ gọn, sắc nét, dễ phối đồ, mặc với quần gì cũng dễ'),
(3, N'Quần Short Kaki Nam ICONDENIM Orgnls', 'uploads/product36.jpg', 350000, N'Shorts KAKI - một trong những mẫu quần shorts không thể thiếu, chất liệu Kaki dày dặn, co giãn nhẹ, xịn khỏi phải bàn'),
(3, N'Áo Thun Nam ICONDENIM Hand-Draw Chain Stitch', 'uploads/product37.jpg', 380000, N'Áo được thiết kế để mang lại sự vừa vặn chắc chắn nhưng thoải mái, giữ được hình dáng qua nhiều lần sử dụng'),
(3, N'Quần Short Nam ICONDENIM Linen Surface Cotton', 'uploads/product38.jpg', 360000, N'Chất vải Linen với đặc tính mỏng nhẹ và mịn mát được ứng dụng trong chiếc quần short cực kỳ hợp khi mang lại cảm giác thoải mái và thông thoáng cho người mặc'),
(3, N'Quần Short Kaki Nam ICONDENIM Garment Dye', 'uploads/product39.jpg', 450000, N'Quần có túi khóa kéo một bên, một điểm cộng giúp bảo vệ an toàn cho các vật dụng cá nhân như điện thoại hay ví tiền khi di chuyển'),
(3, N'Áo Thun Nam ICONDENIM Strength Contour', 'uploads/product40.jpg', 480000, N'Áo được thiết kế để mang lại sự vừa vặn chắc chắn nhưng thoải mái, giữ được hình dáng qua nhiều lần sử dụng'),
(3, N'Áo Thun Nam ICONDENIM Stamp Logo Cuff', 'uploads/product41.jpg', 550000, N'Chất liệu Cotton là chất liệu điển hình, thường thấy nhất trong các mẫu áo thun hiện nay, mang đến cảm giác mềm mại và thoáng mát trên da, cực thích hợp khi mặc trong mùa hè này'),
(3, N'Áo Thun Nam ICONDENIM Oversize Basic', 'uploads/product42.jpg', 490000, N'Form Regular có độ rộng vừa phải, mặc lên người cực thoải mái, giúp anh em hạn chế được đa số khuyết điểm trên người. Đây cũng là form áo được ưa chuộng nhất 160STORE'),
(3, N'Quần Short Nam Khakis ICONDENIM 7" Flex Waistband', 'uploads/product43.jpg', 349000, N'Chất liệu Kaki là loại chất liệu thường thấy trên các loại quần lưng gài. Ở quần short Fundamental này, chất liệu được cải tiến thành kaki thun với ưu điểm là giữ được độ đứng form'),
(3, N'Áo Thun Nam ICONDENIM Awesome Bear', 'uploads/product44.jpg', 150000, N'Chất liệu Cotton này mang đến cảm giác mềm mại và thoáng mát trên da, cực thích hợp khi mặc trong mùa hè này'),
(3, N'Quần Short Tây Nam ICONDENIM Comfort Waistband', 'uploads/product45.jpg', 350000, N'Chất vải quần tây được áp dụng trên quần short này mang đến khả năng hạn chế nhăn đến mức tối đa, đồng thời còn có độ co giãn nhẹ giúp người mặc thoải mái vận động mà không bị cảm giác gò bó'),
(3, N'Áo Sơ Mi Nam Tay Ngắn ICONDENIM Classic', 'uploads/product46.jpg', 490000, N'Sơmi đen trắng dành cho mọi chàng trai công sở. Chất liệu Nano cho bề mặt vải mềm mại, mặc mùa này rất thoải mái. Cổ áo nhọn chuẩn chỉnh và gọn gàng đầy thanh lịch'),
(3, N'Áo Sơ Mi Nam Tay Ngắn N.Y.C ICONDENIM', 'uploads/product47.jpg', 449000, N'Denim là chất liệu dày dặn, bền bỉ với khả năng chịu lực cao, giúp trang phục giữ form tốt và ít bị sờn rách. Vải có độ cứng vừa phải nhưng vẫn mang lại sự thoải mái khi mặc'),
(3, N'Áo Sơ Mi Nam ICONDENIM Heat-Embossed Nubuck Pocket', 'uploads/product48.jpg', 389000, N'Không chỉ mang tính thời trang với vẻ ngoài trẻ trung, hiện đại mà chất liệu denim ở chiếc áo sơ mi này còn là denim mỏng nhẹ tạo cảm giác thoải mái và dễ chịu'),
(3, N'Áo Tanktop ICONDENIM Sleeveless', 'uploads/product49.jpg', 490000, N'Chất liệu vải Rib dày dặn nhưng cực kỳ thông thoáng. Thiết kế bản vai nhỏ điển hình của dòng áo tanktop. Form Slim vừa người mang đến cảm giác thoải mái cho người mặc'),
(3, N'Áo Thun Nam ICONDENIM Feeling Chill', 'uploads/product50.jpg', 279000, N'Chất liệu Cotton là chất liệu điển hình, thường thấy nhất trong các mẫu áo thun hiện nay. Với trong lượng chỉ 220gsm, chất liệu Cotton này mang đến cảm giác mềm mại và thoáng mát trên da'),
(3, N'Áo Sơ mi Cuban Nam ICONDENIM Crochet Lace', 'uploads/product51.jpg', 349000, N'Vải dệt lưới giúp thoáng khí, tạo cảm giác mát mẻ và khô ráo ngay cả khi vận động nhiều. Chất liệu này có khả năng thấm hút mồ hôi nhanh, giúp hạn chế bám dính và mang lại sự thoải mái tối đa'),
(3, N'Quần Short Nam ICONDENIM Regular Fit Short Length', 'uploads/product52.jpg', 399000, N'Chất vải Linen pha mỏng nhẹ, mùa hè mặc siêu mát. Chiếc quần short đơn giản, tiện lợi, dễ mặc, dễ phối. Form Regular trên gối, mặc thoải mái, hạn chế được đa số khuyết điểm'),
(3, N'Quần Short Nỉ Nam ICONDENIM LeisureLoom', 'uploads/product53.jpg', 290000, N'Quần shorts với kiểu dáng lưng thun trên gối, co giãn thoải mái. Chất liệu nỉ cào mềm mại, mùa hè mặc vẫn mát. Form Regular cực thoải mái khi mặc');

INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Descriptions) VALUES
-- COMBO MIX & MATCH
(4, N'Set Đồ Nam ICONDENIM Rugby Football', 'uploads/product54.jpg', 868000, N'Áo và quần đều được in các họa tiết với phong cách thể thao, tạo cảm giác đồng điệu thu hút. Áo sơ mi cổ lá nhọn, cài nút truyền thống phối túi hộp tạo điểm nhấn'),
(4, N'Set Đồ Nam RUNPOW Training', 'uploads/product55.jpg', 648000, N'Nổi bật với độ bền cao, mềm mại, co giãn tốt, rất thích hợp cho việc tập luyện. Nhờ cấu trúc sợi tổng hợp, chất liệu này có khả năng kháng nước nhẹ, nhanh khô hơn so với cotton, giúp tiết kiệm thời gian phơi'),
(4, N'Set Đồ Nam ICONDENIM ORGNLS French Bulldog', 'uploads/product56.jpg', 900000, N'Áo thun cotton mềm mại, thấm hút tốt, mang lại cảm giác dễ chịu và thoáng mát suốt cả ngày. Kết hợp với quần nỉ TC co giãn linh hoạt, giữ nhiệt ổn định nhưng vẫn đảm bảo độ thoáng khí, giúp người mặc luôn thoải mái suốt cả ngày dài'),
(4, N'Set Đồ Nam ICONDENIM Embroidered Essence', 'uploads/product57.jpg', 789000, N'Chất liệu thun cotton jersey dệt ô vuông nổi bật với họa tiết tinh tế, mang lại hiệu ứng thị giác độc đáo và tạo cảm giác sang trọng. Kết cấu ô vuông giúp vải giữ form tốt, ít nhăn và tăng độ bền'),
(4, N'Set Đồ Nam ICONDENIM Heroic ICDN', 'uploads/product58.jpg', 650000, N'Áo làm từ thun cotton và quần từ nỉ CVC. Chất liệu thun cotton mang lại sự mềm mại, thấm hút mồ hôi tốt, giúp người mặc cảm thấy thoải mái và thoáng mát trong các hoạt động hàng ngày'),
(4, N'Set Đồ Nam ICONDENIM Excursion ICDN', 'uploads/product59.jpg', 780000, N'Chất liệu vải có độ bền cao, giữ form tốt nên có thể giặt giũ vô tư mà không lo xù lông hay co rút, giúp giữ được vẻ ngoài bền đẹp sau nhiều lần giặt'),
(4, N'Set Đồ Nam ICONDENIM New York City', 'uploads/product60.jpg', 890000, N'Nỉ cào mềm mại, ấm áp mang lại cảm giác thoải mái nhờ độ co giãn nhẹ, giúp dễ dàng vận động. Bề mặt vải được xử lý cào lông tinh tế giúp giữ nhiệt tốt nhưng vẫn đảm bảo sự thông thoáng'),
(4, N'Set Đồ Nam ICONDENIM ICDN Rugby Football', 'uploads/product61.jpg', 950000, N'Chất liệu này không chỉ mang lại cảm giác thoải mái cho người mặc, lý tưởng cho trang phục casual vì dễ bảo quản, bền màu, và không gây kích ứng cho da, tạo cảm giác dễ chịu suốt cả ngày'),
(4, N'Set Đồ Nam ICONDENIM Smashers Form Regular', 'uploads/product62.jpg', 789000, N'Áo nỉ được thiết kế với phần bo tay và bo lai tinh tế, tạo nên sự cân đối trong phom dáng. Sự hài hòa giữa áo và quần giúp người mặc dễ dàng phối đồ với các loại giày thể thao'),
(4, N'Set Đồ Nam ICONDENIM Mighty Bear', 'uploads/product63.jpg', 684000, N'Áo sử dụng chất liệu thun cotton thoáng mát, thấm hút mồ hôi vượt trội, mang đến cảm giác dễ chịu và thoải mái suốt cả ngày. Quần được làm từ vải nỉ CVC mềm mại, bền bỉ, giữ form dáng lâu dài ngay cả sau nhiều lần giặt'),
(4, N'Set Đồ Nam ICONDENIM America', 'uploads/product64.jpg', 668000, N'Chất liệu thun cotton ở áo giúp phần áo có độ co giãn cao và mịn mát, mặc lên người cực kỳ thoải mái và thấm hút mồ hôi rất tốt. Nỉ CVC ở quần giúp phần quần được đứng form khi mặc lên, hạn chế nhão mà còn hỗ trợ chống nhăn nhẹ'),
(4, N'Set Đồ Nam ICONDENIM Monogram Line', 'uploads/product65.jpg', 700000, N'Chất liệu CVC Double Face ở áo với Pique ở quần cho ra những đường dệt li ti mang đến khả năng thấm hút tốt, thoáng mát và thoải mái khi mặc. Đồng thời, chất liệu này còn hỗ trợ chống nhăn'),
(4, N'Set Đồ Nam ICONDENIM Strong Shoulder', 'uploads/product66.jpg', 985000, N'Chất liệu CVC cá sấu với những đường dệt li ti mang đến khả năng thấm hút tốt, thoáng mát và thoải mái khi mặc lên. Đồng thời, chất liệu này còn hỗ trợ chống nhăn khá hiệu quả'),
(4, N'Set Đồ Nam ICONDENIM Enjoy Life', 'uploads/product67.jpg', 599000, N'Chất liệu thun cotton ở áo giúp phần áo có độ co giãn cao và mịn mát, mặc lên người cực kỳ thoải mái và thấm hút mồ hôi rất tốt. Nỉ chân cua ở quần giúp phần quần được đứng form khi mặc lên, hạn chế nhão quần'),
(4, N'Set Đồ Nam ICONDENIM Denim Printed Sack Type', 'uploads/product68.jpg', 840000, N'Chất liệu Denim nổi tiếng khi chính là chất liệu làm nên tất cả các loại quần jeans. Denim có tính ứng dụng rất cao khi có nhiều biến thể mỏng và dày khác nhau'),
(4, N'Set Đồ Nam ICONDENIM Dreamscape Monogram', 'uploads/product69.jpg', 499000, N'Chất liệu Cotton Chéo cực mịn, cực mát. Toàn bộ áo và quần được in Pattern lạ mắt. Duy nhất một màu Đen không hề kén da. Form Regular năng động, mặc cực thích'),
(4, N'Set Đồ Nam ICONDENIM Hidden Bear', 'uploads/product70.jpg', 399000, N'Full set với áo thun và quần shorts lưng thun trên gối. Chất vải thun lạnh mềm mại với kỹ thuật dệt sọc gân nổi siêu đẹp. Áo Sơmi Cuban-Shirts dày dặn, đứng form, bề mặt vải mềm mại, mặc khá thích'),
(4, N'Set Đồ Nam ICONDENIM Maze ID Pattern', 'uploads/product71.jpg', 720000, N'Quần shorts lưng thun co giãn, không quá ôm. Hoạ tiết Maze liên kết bởi 2 kí tự ID được in định vị trên toàn áo, cực ấn tượng. Form Regular năng động, mặc cực thích'),
(4, N'Set Đồ Nam ICONDENIM Oversize Printed', 'uploads/product72.jpg', 550000, N'Set đồ năng động ICONDENIM với form dáng oversize rộng rãi, giúp bạn tự do vận động cả ngày dài. Thiết kế Oversize mang lại phong cách thời trang tươi mới và thoải mái, phù hợp với nhu cầu của người mua'),
(4, N'Set Đồ Nam ICONDENIM Maximalism', 'uploads/product73.jpg', 950000, N'Form ở bên ngoài nhưng vẫn giữ được sự mềm mại bên trong, giúp tối đa hóa cảm giác thoải mái của người mặc. Thiết kế được lấy cảm hứng từ những bộ đồ bóng rổ năng động, được cách điệu lại với họa tiết monogram');

ALTER TABLE Orders
ADD 
    PaymentMethod NVARCHAR(50),
    OrderNotes NVARCHAR(255),
    VoucherCode NVARCHAR(50);
