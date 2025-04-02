const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");
const { poolPromise, sql } = require("../db");
require("dotenv").config();

// Đăng ký User
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await createUser(fullName, email, hashedPassword);

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Lỗi server!", error });
  }
};

// Đăng nhập User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });
    }

    const token = jwt.sign({ userId: user.UserID }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.UserID, email: user.Email, fullName: user.FullName },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};

// Reset Password
exports.requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    // Tạo mật khẩu mới mặc định
    const newPassword = "123456";

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới vào database
    const pool = await poolPromise;
    await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .query(
        "UPDATE Users SET PasswordHash = @PasswordHash WHERE Email = @Email"
      );

    return res.json({
      message:
        "Mật khẩu đã được đặt lại. Vui lòng sử dụng mật khẩu mới là: 123456 để đăng nhập. Để bảo mật thông tin vui lòng đổi mật khẩu mới sau khi đăng nhập!",
    });
  } catch (error) {
    console.error("❌ Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};
