const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../models/categoryModel");

// API: Lấy tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const categories =