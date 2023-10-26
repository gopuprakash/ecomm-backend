const express = require("express");
const { createBlog } = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-blog", authMiddleware, isAdmin, createBlog);

module.exports = router;