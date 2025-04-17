const express = require("express");
const router = express.Router();
const { getUserById, updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:userId", authMiddleware, getUserById);
router.put("/:userId", authMiddleware, updateUser);

module.exports = router;
