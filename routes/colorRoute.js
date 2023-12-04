const express = require("express");
const {
  createColor,
  deleteColor,
  updateColor,
  getColor,
  getallColors,
} = require("../controller/colorCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createColor);
router.delete("/:_id", authMiddleware, isAdmin, deleteColor);
router.get("/", getallColors);
router.get("/:_id", getColor); 
router.put("/", authMiddleware, isAdmin, updateColor);

module.exports = router;
