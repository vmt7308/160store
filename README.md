# 160STORE - Chuỗi Phân Phối Thời Trang Nam Chuẩn Hiệu

## Giới thiệu

160STORE là một hệ thống quản lý và bán hàng trực tuyến chuyên về thời trang nam. Dự án bao gồm các tính năng như quản lý sản phẩm, danh mục, giỏ hàng, thanh toán, quản lý đơn hàng, và giao diện quản trị viên. Hệ thống được xây dựng với kiến trúc client-server, MVC, sử dụng ReactJS cho giao diện người dùng và Node ExpressJS cho backend.

---

## Mục lục

1. [Cài đặt](#cài-đặt)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
4. [Tính năng chính](#tính-năng-chính)
5. [API Backend](#api-backend)
6. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
7. [Đóng góp](#đóng-góp)
8. [Liên hệ](#liên-hệ)

---

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 14.x
- npm >= 6.x
- MySQL hoặc SQL Server

### Hướng dẫn cài đặt

1. Clone dự án:

   ```bash
   git clone https://github.com/vmt7308/160store.git
   cd 160store

   ```

2. Cài đặt dependencies cho frontend:

   ```bash
   cd 160store
   npm install

   ```

3. Cài đặt dependencies cho backend:

   ```bash
   cd 160store/backend
   npm install

   ```

4. Cấu hình cơ sở dữ liệu và chatbot ai:
   - Tạo cơ sở dữ liệu và import file 160storeDB.sql từ thư mục backend/160storeDB.sql
   - Cập nhật thông tin kết nối cơ sở dữ liệu trong file .env ở thư mục backend/.env
   - Cài đặt thư viện cần thiết cho backend:
   ```bash
   cd backend
   npm i natural@latest ml-matrix@latest mssql@latest axios@latest dotenv@latest

   ```

5. Chạy backend:
   ```bash
   cd backend
   node server.js

   ```

6. Chạy frontend:

   ```bash
   cd 160store
   npm start

   ```

7. Truy cập ứng dụng tại:

   - Khách hàng (User):

   ```bash
   http://localhost:3000

   ```

   - Quản trị viên (Admin): Tài khoản Admin mặt định: admin@160store.com - admin123

   ```bash
   http://localhost:3000/admin

   ```

   - Backend:

   ```bash
   http://localhost:5000

   ```

## Cấu trúc thư mục

160store/
├── backend/ # Backend API
│ ├── controllers/ # Xử lý logic API
│ ├── middleware/ # Middleware (e.g., xác thực)
│ ├── models/ # Tương tác với cơ sở dữ liệu
│ ├── routes/ # Định nghĩa các route API
│ ├── .env # Cấu hình môi trường
│ ├── [server.js] # Điểm khởi chạy backend
│ └── 160storeDB.sql # File cấu trúc cơ sở dữ liệu
├── public/ # Tài nguyên tĩnh
│ ├── favicon.png # Icon trang web
│ └── [index.html] # File HTML chính
├── src/ # Frontend ReactJS
│ ├── assets/ # Tài nguyên (CSS, Font, hình ảnh)
│ ├── components/ # Các thành phần giao diện dùng chung
│ ├── pages/ # Các trang chính
│ ├── [App.js] # Điểm khởi chạy frontend
│ └── index.js # Render ứng dụng React
└── [README.md] # Tài liệu dự án

## Hướng dẫn sử dụng

1. Người dùng

- Truy cập trang chủ để xem danh mục sản phẩm, sản phẩm, chi tiết sản phẩm,...
- Thêm sản phẩm vào giỏ hàng.
- Đăng ký hoặc đăng nhập để tiến hành thanh toán.
- Theo dõi đơn hàng trong mục "Tài khoản".
- Đơn hàng: Người dùng có thể hủy đơn trước khi shop xác nhận
- Đánh giá và bình luận về sản phẩm đã mua: Khách hàng đã mua sản phẩm sẽ rate số sao sản phẩm, để lại ảnh thực tế, đánh giá và bình luận
- Hiển thị lại Đánh giá và bình luận

2. Quản trị viên

- Đăng nhập vào /admin.
- Quản lý danh mục, sản phẩm, đơn hàng, và người dùng,...
- Xem thống kê doanh thu.

## Tính năng chính

1. Frontend

- Trang chủ: Hiển thị danh mục sản phẩm, sản phẩm, chi tiết sản phẩm và banner quảng cáo,...
- Giỏ hàng: Quản lý sản phẩm trong giỏ hàng.
- Thanh toán: Hỗ trợ thanh toán COD và MoMo.
- Tài khoản: Quản lý thông tin cá nhân và lịch sử đơn hàng.
- Chatbot AI

2. Backend

- Quản lý sản phẩm: CRUD Thêm, sửa, xóa sản phẩm.
- Quản lý danh mục: CRUD Thêm, sửa, xóa danh mục.
- Quản lý đơn hàng: Xác nhận, cập nhật trạng thái đơn hàng.
- Quản lý người dùng: CRUD Thêm, sửa, xóa tài khoản người dùng.
- Chatbot AI

## API Backend

1. Authentication

- POST /api/auth/login: Đăng nhập.
- POST /api/auth/register: Đăng ký.

2. Sản phẩm

- GET /api/products: Lấy danh sách sản phẩm.
- POST /api/admin/products: Thêm sản phẩm (Admin).

3. Đơn hàng

- GET /api/orders: Lấy danh sách đơn hàng.
- POST /api/orders: Tạo đơn hàng.

4. Người dùng

- GET /api/users/:id: Lấy thông tin người dùng.
- PUT /api/users/:id: Cập nhật thông tin người dùng.

## Công nghệ sử dụng

1. Frontend: HTML, CSS, JAVASCRIPT, ReactJS, React Router, Axios
2. Backend: Node.js, Express.js, MSSQL Server (hoặc MySQL)
3. Khác: 
   - CSS3, GSAP (Hiệu ứng động cho thêm sản phẩm vào giỏ hàng)

## Đóng góp

1. Fork dự án.
2. Tạo nhánh mới:

   ```bash
   git checkout -b feature/your-feature

   ```

3. Commit thay đổi:

   ```bash
   git commit -m "Add your feature"

   ```

4. Push nhánh

   ```bash
   git push origin feature/your-feature

   ```

5. Tạo Pull Request.

## Liên hệ

1. Email: vmt7308@gmail.com
2. Số điện thoại (Zalo): 0522586725
3. Facebook: https://www.facebook.com/vmt7308
