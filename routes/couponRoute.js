const express = require("express");
const {
    createCoupon,
    deleteCoupon,
    updateCoupon,
    getCoupon,
    getallCoupons,
  } = require("../controller/couponCtrl");
  const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
  
  const router = express.Router();
  
  router.post("/", authMiddleware, isAdmin, createCoupon);
  router.delete("/:_id", authMiddleware, isAdmin, deleteCoupon);
  router.get("/", getallCoupons);
  router.get("/:_id", getCoupon); 
  router.put("/", authMiddleware, isAdmin, updateCoupon);
  
  module.exports = router;