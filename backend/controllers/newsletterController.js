const { poolPromise } = require("../db");
const sql = require("mssql");

exports.subscribeNewsletter = async (req, res) => {
    const { email } = req.body;

    // Kiểm tra email hợp lệ
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    try {
        const pool = await poolPromise;

        // Kiểm tra email đã tồn tại
        const checkResult = await pool.request()
            .input("Email", sql.NVarChar, email)
            .query("SELECT Email FROM Newsletter WHERE Email = @Email");

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ message: "Email này đã đăng ký rồi!" });
        }

        // Lưu email vào DB
        await pool.request()
            .input("Email", sql.NVarChar, email)
            .query("INSERT INTO Newsletter (Email) VALUES (@Email)");

        res.json({ message: "Đăng ký nhận tin thành công!" });
    } catch (error) {
        console.error("Lỗi đăng ký nhận tin:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};