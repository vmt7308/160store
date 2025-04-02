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

// Tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá
const searchProducts = async (
  keyword,
  categoryId = null,
  minPrice = null,
  maxPrice = null
) => {
  try {
    let pool = await sql.connect(dbConfig);
    let query = "SELECT * FROM Products WHERE 1=1";
    const request = pool.request();

    // Tìm theo keyword
    if (keyword && keyword.trim() !== "") {
      query += " AND ProductName LIKE @keyword";
      request.input("keyword", sql.NVarChar, `%${keyword}%`);
    }

    // Lọc theo danh mục
    if (categoryId) {
      query += " AND CategoryID = @categoryId";
      request.input("categoryId", sql.Int, categoryId);
    }

    // Lọc theo khoảng giá
    if (minPrice !== null) {
      query += " AND Price >= @minPrice";
      request.input("minPrice", sql.Decimal(10, 2), minPrice);
    }

    if (maxPrice !== null) {
      query += " AND Price <= @maxPrice";
      request.input("maxPrice", sql.Decimal(10, 2), maxPrice);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi tìm kiếm sản phẩm:", error);
    throw error;
  }
};

module.exports = { getAllProducts, getProductsByCategory, searchProducts };
