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
    Color NVARCHAR(50),
    Size NVARCHAR(20),
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
--     FORMAT(OrderDate, 'yyyy-MM') AS Month,
--     SUM(TotalAmount) AS TotalRevenue
-- FROM Orders
-- GROUP BY FORMAT(OrderDate, 'yyyy-MM');

-- Thêm dữ liệu
INSERT INTO Categories (CategoryName) VALUES
(N'HÀNG MỚI MỖI NGÀY'), (N'HÀNG BÁN CHẠY'), (N'TỦ ĐỒ MÙA HÈ'), (N'COMBO MIX & MATCH');

INSERT INTO Products (CategoryID, ProductName, ImageURL, Price, Color, Size, Descriptions) VALUES
-- HÀNG MỚI MỖI NGÀY
(1, N'Áo sơ mi trắng', 'uploads/product1.jpg', 350000, N'Trắng', 'M', N'Áo sơ mi vải cotton cao cấp'),
(1, N'Áo sơ mi xanh', 'uploads/product1.jpg', 370000, N'Xanh', 'L', N'Áo sơ mi trẻ trung lịch lãm'),
(1, N'Áo sơ mi đen', 'uploads/product1.jpg', 390000, N'Đen', 'M', N'Áo sơ mi lịch lãm cho nam'),
(1, N'Áo sơ mi caro đỏ', 'uploads/product1.jpg', 380000, N'Đỏ', 'L', N'Áo sơ mi caro phong cách'),
(1, N'Áo sơ mi sọc xanh', 'uploads/product1.jpg', 375000, N'Xanh', 'M', N'Áo sơ mi sọc trẻ trung'),
(1, N'Áo sơ mi dài tay đen', 'uploads/product1.jpg', 400000, N'Đen', 'XL', N'Áo sơ mi dài tay thanh lịch'),
(1, N'Áo sơ mi cộc tay trắng', 'uploads/product1.jpg', 320000, N'Trắng', 'S', N'Áo sơ mi cộc tay mát mẻ'),
(1, N'Áo sơ mi linen xanh', 'uploads/product1.jpg', 410000, N'Xanh', 'M', N'Áo sơ mi linen thoáng mát'),
(1, N'Áo sơ mi cotton đen', 'uploads/product1.jpg', 380000, N'Đen', 'L', N'Áo sơ mi cotton mềm mại'),
(1, N'Áo sơ mi họa tiết', 'uploads/product1.jpg', 390000, N'Xanh', 'M', N'Áo sơ mi họa tiết phong cách'),

-- HÀNG BÁN CHẠY
(2, N'Áo thun đen', 'uploads/product1.jpg', 250000, N'Đen', 'M', N'Áo thun cotton mềm mại'),
(2, N'Áo thun đỏ', 'uploads/product1.jpg', 260000, N'Đỏ', 'L', N'Áo thun phong cách năng động'),
(2, N'Áo thun xanh navy', 'uploads/product1.jpg', 270000, N'Xanh', 'M', N'Áo thun đơn giản dễ phối đồ'),
(2, N'Áo thun form rộng trắng', 'uploads/product1.jpg', 280000, N'Trắng', 'XL', N'Áo thun form rộng thoải mái'),
(2, N'Áo thun cotton đen', 'uploads/product1.jpg', 265000, N'Đen', 'M', N'Áo thun cotton cao cấp'),
(2, N'Áo thun in hình', 'uploads/product1.jpg', 275000, N'Trắng', 'L', N'Áo thun họa tiết thời trang'),
(2, N'Áo thun basic xanh', 'uploads/product1.jpg', 250000, N'Xanh', 'M', N'Áo thun basic dễ mặc'),
(2, N'Áo thun tay lỡ đen', 'uploads/product1.jpg', 290000, N'Đen', 'L', N'Áo thun tay lỡ cá tính'),
(2, N'Áo thun thể thao trắng', 'uploads/product1.jpg', 300000, N'Trắng', 'S', N'Áo thun thể thao co giãn'),

-- TỦ ĐỒ MÙA HÈ
(3, N'Quần jean xanh', 'uploads/product1.jpg', 500000, N'Xanh', '32', N'Quần jean form slimfit'),
(3, N'Quần jean đen', 'uploads/product1.jpg', 520000, N'Đen', '34', N'Quần jean cá tính'),
(3, N'Quần short kaki nâu', 'uploads/product1.jpg', 350000, N'Nâu', '32', N'Quần short kaki thoải mái'),
(3, N'Quần short jeans xanh', 'uploads/product1.jpg', 380000, N'Xanh', '30', N'Quần short jeans trẻ trung'),
(3, N'Quần short đen', 'uploads/product1.jpg', 360000, N'Đen', '31', N'Quần short vải dễ mặc'),
(3, N'Quần jogger xám', 'uploads/product1.jpg', 450000, N'Xám', 'L', N'Quần jogger thể thao năng động'),
(3, N'Quần kaki đen', 'uploads/product1.jpg', 480000, N'Đen', '32', N'Quần kaki thời trang nam'),
(3, N'Quần jean rách gối', 'uploads/product1.jpg', 550000, N'Xanh', '34', N'Quần jean rách phong cách'),
(3, N'Quần baggy jean', 'uploads/product1.jpg', 490000, N'Xanh', '30', N'Quần baggy jean trendy'),

-- COMBO MIX & MATCH
(4, N'Set áo thun + quần jean', 'uploads/product1.jpg', 700000, N'Đen', 'M', N'Combo thời trang cá tính'),
(4, N'Set sơ mi + quần kaki', 'uploads/product1.jpg', 800000, N'Xanh', 'L', N'Bộ trang phục lịch lãm'),
(4, N'Set áo hoodie + quần jogger', 'uploads/product1.jpg', 900000, N'Xám', 'XL', N'Set thể thao năng động'),
(4, N'Set áo polo + quần tây', 'uploads/product1.jpg', 850000, N'Trắng', 'M', N'Phong cách sang trọng'),
(4, N'Set áo thun + quần short', 'uploads/product1.jpg', 650000, N'Đỏ', 'L', N'Set trẻ trung mùa hè'),
(4, N'Set áo sơ mi + quần baggy', 'uploads/product1.jpg', 780000, N'Xanh', 'M', N'Bộ trang phục đơn giản lịch sự'),
(4, N'Set hoodie + quần jean', 'uploads/product1.jpg', 890000, N'Đen', 'L', N'Set cá tính phong cách'),
(4, N'Set áo khoác + quần jogger', 'uploads/product1.jpg', 950000, N'Xám', 'XL', N'Trang phục streetwear chất lừ');