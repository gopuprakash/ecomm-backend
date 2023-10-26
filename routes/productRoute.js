const express = require("express");
const { createProduct, deleteProduct, getallProducts, getProduct, updateProduct } = require("../controller/productCtrl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-product", authMiddleware, isAdmin, createProduct);
router.delete("/:_id", authMiddleware, deleteProduct);
router.get("/all-products", authMiddleware, isAdmin, getallProducts);
router.get("/:_id", authMiddleware, getProduct);
router.put("/update-product", authMiddleware, isAdmin, updateProduct);

module.exports = router;