const express = require("express");
const { createProdCategory, deleteProdCategory, updateProdCategory, getProdCategory, getallProdCategories } = require("../controller/prodCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProdCategory);
router.delete("/:_id", authMiddleware, isAdmin, deleteProdCategory);
router.get("/", getallProdCategories);
router.get("/:_id", getProdCategory);
router.put("/", authMiddleware, isAdmin, updateProdCategory);

module.exports = router;