const express = require("express");
const {
  createBlog,
  deleteBlog,
  getBlog,
  updateBlog,
  getallBlogs,
  likeBlog,
  dislikeBlog,
  uploadImages
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.delete("/:_id", authMiddleware, deleteBlog);
router.get("/", getallBlogs);
router.get("/:_id", getBlog);
router.put("/", authMiddleware, isAdmin, updateBlog);
router.put("/like-blog", authMiddleware, likeBlog);
router.put("/dislike-blog", authMiddleware, dislikeBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);

module.exports = router;
