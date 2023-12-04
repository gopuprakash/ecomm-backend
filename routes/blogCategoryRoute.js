const express = require("express");
const { createBlogCategory, deleteBlogCategory, updateBlogCategory, getBlogCategory, getallBlogCategories } = require("../controller/blogCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlogCategory);
router.delete("/:_id", authMiddleware, isAdmin, deleteBlogCategory);
router.get("/", getallBlogCategories);
router.get("/:_id", getBlogCategory);
router.put("/", authMiddleware, isAdmin, updateBlogCategory);

module.exports = router;