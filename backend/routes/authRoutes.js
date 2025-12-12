const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestResetPassword,
  changePassword,
  verifyEmail,
  resetPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", requestResetPassword);
router.post("/change-password", authMiddleware, changePassword);

router.get("/verify", verifyEmail);
router.post("/reset", resetPassword);

module.exports = router;
