const express = require("express");
const {
  createBrand,
  deleteBrand,
  updateBrand,
  getBrand,
  getallBrands,
} = require("../controller/brandCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.delete("/:_id", authMiddleware, isAdmin, deleteBrand);
router.get("/", getallBrands);
router.get("/:_id", getBrand); 
router.put("/", authMiddleware, isAdmin, updateBrand);

module.exports = router;
