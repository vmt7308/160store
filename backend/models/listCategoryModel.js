const { sql, poolPromise } = require("../db");

const getAllCategories = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Categories");
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCategories,
};
