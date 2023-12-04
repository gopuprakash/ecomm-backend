const express = require("express");
const {
  createAddress,
  deleteAddress,
  updateAddress,
  getAddress,
  getallAddresses,
} = require("../controller/addressCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createAddress);
router.delete("/:_id", authMiddleware, isAdmin, deleteAddress);
router.get("/", authMiddleware, getallAddresses);
router.get("/:_id", authMiddleware, isAdmin, getAddress); 
router.put("/", authMiddleware, isAdmin, updateAddress);

module.exports = router;