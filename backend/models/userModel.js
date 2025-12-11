require("dotenv").config();
const { poolPromise, sql } = require("../db");

// Tạo tài khoản (thêm IsVerified = 0)
exports.createUser = async (fullName, email, hashedPassword) => {
  try {
    const pool = await poolPromise;
    return pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .input("IsVerified", sql.Bit, 0)
      .query(
        "INSERT INTO Users (FullName, Email, PasswordHash, IsVerified) VALUES (@FullName, @Email, @PasswordHash, @IsVerified)"
      );
  } catch (error) {
    console.error("❌ Lỗi khi tạo user:", error);
    throw error;
  }
};

// Tìm user theo email
exports.findUserByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @Email");
    return result.recordset[0];
  } catch (error) {
    console.error("❌ Lỗi khi tìm user:", error);
    throw error;
  }
};

// Tìm user theo ID
exports.findUserById = async (userId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT * FROM Users WHERE UserID = @UserID");
    return result.recordset[0];
  } catch (error) {
    console.error("❌ Lỗi khi tìm user theo ID:", error);
    throw error;
  }
};
