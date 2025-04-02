# Cấu trúc thư mục dự án
160store/
│── public/            # Chứa index.html, favicon
│── src/
│   │── assets/        # Chứa css, font, hình ảnh img
│   │── components/    # Chứa các component tái sử dụng
│   │── pages/         # Chứa các trang chính
│   │── App.js         # File chính chứa Routes
│   └── index.js       # Điểm vào của ứng dụng
│── package.json       # Chứa thông tin dependencies
└── README.md
└── backend/
    │── node_modules/
    │── controllers/
    │   ├── authController.js
    │── models/
    │   ├── userModel.js
    │   ├── productModel.js
    │── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │── utils/
    │   ├── sendEmail.js
    │── uploads/
    │   ├── product1.jpg
    │── .env
    │── server.js
    │── package.json
    │── db.js