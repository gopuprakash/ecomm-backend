const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");

//create Coupon

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const coupon = await Coupon.findOne({ name });
    if (!coupon) {
      const newCoupon = await Coupon.create(req.body);
      res.json(newCoupon);
    } else {
      throw new Error("Coupon with same name already exists");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (deletedCoupon) {
      const msg = `Coupon ${id} deleted`;
      res.json({
        message: msg,
      });
    } else {
      throw new Error("No Coupon found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const findCoupon = await Coupon.findById(id);
    if (findCoupon) {
      res.json(findCoupon);
    } else {
      throw new Error("No Coupon found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get all Coupons
const getallCoupons = asyncHandler(async (req, res) => {
  try {
    const getallCoupons = await Coupon.find();
    res.json(getallCoupons);
  } catch (error) {
    throw new Error(error);
  }
});

//update Coupon
const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        name: req?.body?.name,
        expiry: req?.body?.expiry,
        discount: req?.body?.discount,
      },
      {
        new: true,
      }
    );
    if (updatedCoupon) {
      res.json(updatedCoupon);
    } else {
      throw new Error("No Coupon found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCoupon,
  deleteCoupon,
  getCoupon,
  updateCoupon,
  getallCoupons,
};
