const express = require("express");
const router = express.Router();
const { getUserById, updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);

module.exports = router;
