// File này dùng để tạo mật khẩu cho tài khoản Admin với mật khẩu đã hash bằng bcrypt
// Lệnh chạy: node hash-password.js

// Tài khoản: admin@160store.com
// Mật khẩu: admin123
const bcrypt = require("bcryptjs");

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("admin123", salt);

console.log(hash);
