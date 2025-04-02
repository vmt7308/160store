const { poolPromise, sql } = require("../db");

exports.getAllCategories = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT CategoryID, CategoryName FROM Categories");
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh mục:", error);
    throw error;
  }
};