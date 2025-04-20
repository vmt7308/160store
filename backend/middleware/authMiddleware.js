const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra loại token và gán vào req.user hoặc req.admin
    if (decoded.userId) {
      req.user = decoded; // Gán cho user nếu token chứa userId
    } else if (decoded.adminId) {
      req.admin = decoded; // Gán cho admin nếu token chứa adminId
    } else {
      return res
        .status(401)
        .json({ message: "Token không chứa thông tin hợp lệ!" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ!" });
  }
};
