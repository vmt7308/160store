const sql = require("mssql");

// Kết nối database từ .env
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: false, enableArithAbort: true },
};

// Lấy tất cả sản phẩm
const getAllProducts = async () => {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request().query("SELECT * FROM Products");
  return result.recordset;
};

// Lấy sản phẩm theo danh mục
const getProductsByCategory = async (categoryId) => {
  let pool = await sql.connect(dbConfig);
  let result = await pool
    .request()
    .input("categoryId", sql.Int, categoryId)
    .query("SELECT * FROM Products WHERE categoryId = @categoryId");
  return result.recordset;
};

module.exports = { getAllProducts, getProductsByCategory };
