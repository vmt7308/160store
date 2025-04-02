const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestResetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", requestResetPassword);

module.exports = router;
