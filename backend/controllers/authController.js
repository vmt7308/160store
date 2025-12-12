const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { createUser, findUserByEmail, findUserById } = require("../models/userModel");
const { poolPromise, sql } = require("../db");
require("dotenv").config();

// Tạo transporter cho Gmail (free)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // App Password
  },
});

// Đăng ký User + gửi email xác thực
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user với IsVerified = 0
    await createUser(fullName, email, hashedPassword);

    // Tạo token xác thực (expire 1 giờ)
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Link xác thực gọi BACKEND (để backend redirect)
    const verificationLink = `http://localhost:5000/api/auth/verify?token=${verificationToken}`;

    // Gửi email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác thực tài khoản 160store",
      html: `
        <p>Xin chào ${fullName},</p>
        <p>Vui lòng click vào link dưới để xác thực tài khoản:</p>
        <a href="${verificationLink}">Xác thực ngay</a>
        <p>Link hết hạn sau 1 giờ. Nếu không phải bạn, bỏ qua email này.</p>
        <p>Trân trọng,<br>160store Team</p>
      `,
    });

    res.status(201).json({ message: "Đăng ký thành công! Kiểm tra email để xác thực." });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "❌ Lỗi server!", error });
  }
};

// Xác thực email từ link – HIỂN THỊ THÔNG BÁO – BACKEND XỬ LÝ + REDIRECT VỀ LOGIN
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực thất bại</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;height:100vh;background:linear-gradient(135deg,#ff6b6b,#ee5a52);font-family:'Poppins',sans-serif;display:flex;justify-content:center;align-items:center;">
        <div style="background:white;padding:60px 50px;border-radius:25px;box-shadow:0 20px 50px rgba(0,0,0,0.3);text-align:center;max-width:500px;width:90%;">
          <h2 style="color:#e74c3c;font-size:32px;margin:20px 0;">Link không hợp lệ!</h2>
          <p style="color:#555;font-size:18px;">Vui lòng kiểm tra lại email hoặc đăng ký mới.</p>
          <a href="http://localhost:3000/register" style="display:inline-block;margin-top:30px;padding:15px 40px;background:#e74c3c;color:white;border-radius:50px;text-decoration:none;font-weight:600;">Đăng ký lại</a>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    const pool = await poolPromise;
    await pool.request()
      .input("Email", sql.NVarChar, email)
      .query("UPDATE Users SET IsVerified = 1 WHERE Email = @Email");

    // TRANG XÁC THỰC THÀNH CÔNG
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực thành công</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
      </head>
      <body style="margin:0;padding:0;height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);font-family:'Poppins',sans-serif;display:flex;justify-content:center;align-items:center;overflow:hidden;">
        <div style="background:white;padding:70px 50px;border-radius:30px;box-shadow:0 30px 60px rgba(0,0,0,0.3);text-align:center;max-width:600px;width:90%;animation:pop 0.8s ease-out;">
          <i class="fa-solid fa-circle-check" style="font-size:100px;color:#28a745;margin-bottom:30px;"></i>
          <h2 style="color:#28a745;font-size:36px;margin:30px 0;font-weight:700;">Xác thực tài khoản thành công!</h2>
          <p style="color:#555;font-size:20px;margin:20px 0;">
            Chúc mừng <strong style="color:#667eea;">${email}</strong> <br>đã kích hoạt tài khoản 160store!
          </p>
          <p style="color:#888;font-size:18px;margin:40px 0;">
            Đang chuyển đến trang đăng nhập trong <strong id="countdown" style="color:#ff8c42;font-size:24px;">7</strong> giây...
          </p>
          <a href="http://localhost:3000/login" style="display:inline-block;padding:18px 50px;background:linear-gradient(45deg,#ff8c42,#ff6b35);color:white;border-radius:50px;text-decoration:none;font-size:18px;font-weight:600;box-shadow:0 10px 25px rgba(255,107,53,0.4);transition:0.3s;">
            Đăng nhập ngay
          </a>
        </div>

        <style>
          @keyframes pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          a:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(255,107,53,0.6);
          }
        </style>

        <script>
          let time = 7;
          const countdown = setInterval(() => {
            time--;
            document.getElementById("countdown").textContent = time;
            if (time <= 0) {
              clearInterval(countdown);
              window.location.href = "http://localhost:3000/login";
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực thất bại</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;height:100vh;background:#ff6b6b;font-family:'Poppins',sans-serif;display:flex;justify-content:center;align-items:center;">
        <div style="background:white;padding:60px 50px;border-radius:25px;box-shadow:0 20px 50px rgba(0,0,0,0.3);text-align:center;max-width:500px;width:90%;">
          <h2 style="color:#e74c3c;font-size:32px;margin:20px 0;">Link đã hết hạn!</h2>
          <p style="color:#555;font-size:18px;">Vui lòng đăng ký lại để nhận link mới.</p>
          <a href="http://localhost:3000/register" style="display:inline-block;margin-top:30px;padding:15px 40px;background:#e74c3c;color:white;border-radius:50px;text-decoration:none;font-weight:600;">Đăng ký lại</a>
        </div>
      </body>
      </html>
    `);
  }
};

// User login (check IsVerified)
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

    if (!user.IsVerified) {
      return res.status(400).json({ message: "Tài khoản chưa xác thực email!" });
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

// Khôi phục mật khẩu – gửi link reset qua email
exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "❌ Email không tồn tại!" });

    const resetToken = jwt.sign({ userId: user.UserID }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Khôi phục mật khẩu 160store",
      html: `
        <p>Xin chào,</p>
        <p>Click vào link dưới để khôi phục mật khẩu:</p>
        <a href="${resetLink}">Khôi phục mật khẩu</a>
        <p>Link hết hạn sau 1 giờ. Nếu không phải bạn, bỏ qua.</p>
      `,
    });

    res.json({ message: "✅ Link khôi phục đã gửi đến email của bạn!" });
  } catch (error) {
    console.error("❌ Lỗi gửi reset password:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};

// Đổi mật khẩu mới từ token reset
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const pool = await poolPromise;
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .query("UPDATE Users SET PasswordHash = @PasswordHash WHERE UserID = @UserID");

    res.json({ message: "✅ Mật khẩu đã được khôi phục thành công!" });
  } catch (error) {
    res.status(400).json({ message: "❌ Link hết hạn hoặc không hợp lệ!" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId; // From authMiddleware

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT PasswordHash FROM Users WHERE UserID = @UserID");

    const user = result.recordset[0];
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .query(
        "UPDATE Users SET PasswordHash = @PasswordHash WHERE UserID = @UserID"
      );

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
};
