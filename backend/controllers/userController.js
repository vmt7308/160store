const { findUserById, updateUser } = require("../models/userModel");
const { poolPromise, sql } = require("../db");

// Lấy thông tin user theo ID
exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    // Không trả về PasswordHash
    const { PasswordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { FullName, Email, PhoneNumber, Address } = req.body;

  if (!FullName || !Email || !PhoneNumber || !Address) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar, FullName)
      .input("Email", sql.NVarChar, Email)
      .input("PhoneNumber", sql.NVarChar, PhoneNumber)
      .input("Address", sql.NVarChar, Address)
      .query(
        "UPDATE Users SET FullName = @FullName, Email = @Email, PhoneNumber = @PhoneNumber, Address = @Address WHERE UserID = @UserID"
      );

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
