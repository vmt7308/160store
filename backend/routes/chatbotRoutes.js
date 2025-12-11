const express = require("express");
const router = express.Router();
const { processMessage } = require("../controllers/chatbotController");

router.post("/", processMessage);

module.exports = router;
