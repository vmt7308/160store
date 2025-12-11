const sql = require("mssql");

// Kết nối database từ .env
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: false, enableArithAbort: true },
};

// Hàm quản lý kết nối an toàn
const executeQuery = async (query, params = {}) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Gán tham số truy vấn
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value.type, value.value);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("❌ Lỗi truy vấn:", error);
    throw error;
  } finally {
    if (pool) pool.close();
  }
};

// Lấy tất cả sản phẩm
const getAllProducts = async () => {
  return await executeQuery("SELECT * FROM Products");
};

// Lấy sản phẩm theo danh mục
const getProductsByCategory = async (categoryId) => {
  return await executeQuery(
    "SELECT * FROM Products WHERE CategoryID = @categoryId",
    {
      categoryId: { type: sql.Int, value: categoryId },
    }
  );
};

// Tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá
const searchProducts = async (
  keyword,
  categoryId = null,
  minPrice = null,
  maxPrice = null
) => {
  try {
    let query = "SELECT * FROM Products WHERE 1=1";
    const params = {};

    // Tìm theo keyword
    if (keyword && keyword.trim() !== "") {
      query += " AND ProductName LIKE @keyword";
      params.keyword = { type: sql.NVarChar, value: `%${keyword}%` };
    }

    // Lọc theo danh mục
    if (categoryId) {
      query += " AND CategoryID = @categoryId";
      params.categoryId = { type: sql.Int, value: categoryId };
    }

    // Lọc theo khoảng giá với điều kiện hợp lệ
    if (minPrice !== null) {
      minPrice = Math.max(0, parseFloat(minPrice)); // Giá trị không âm
      query += " AND Price >= @minPrice";
      params.minPrice = { type: sql.Decimal(10, 2), value: minPrice };
    }

    if (maxPrice !== null) {
      maxPrice = Math.max(0, parseFloat(maxPrice)); // Giá trị không âm
      if (maxPrice >= minPrice) {
        query += " AND Price <= @maxPrice";
        params.maxPrice = { type: sql.Decimal(10, 2), value: maxPrice };
      }
    }

    return await executeQuery(query, params);
  } catch (error) {
    console.error("❌ Lỗi tìm kiếm sản phẩm:", error);
    throw error;
  }
};

module.exports = { getAllProducts, getProductsByCategory, searchProducts };
