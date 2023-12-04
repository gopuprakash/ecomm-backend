const express = require("express");
const {
  createProduct,
  deleteProduct,
  getallProducts,
  getProduct,
  updateProduct,
  addToWishlist,
  rateProduct,
  uploadImages,
} = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.delete("/:_id", authMiddleware, deleteProduct);
router.get("/", getallProducts);
router.get("/:_id", getProduct);
router.put("/", authMiddleware, isAdmin, updateProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rate-product", authMiddleware, rateProduct);
router.put(
  "/upload/:id", 
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

module.exports = router; 
