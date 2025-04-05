const { sql, poolPromise } = require("../db");

const getProductsByCategory = async (categoryId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("categoryId", sql.Int, categoryId)
      .query("SELECT * FROM Products WHERE CategoryID = @categoryId");
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProductsByCategory,
};
