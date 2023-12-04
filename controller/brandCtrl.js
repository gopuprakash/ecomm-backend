const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");


//create Brand

const createBrand = asyncHandler(async (req, res) => {
    try {
      const { title } = req.body;
      const brand = await Brand.findOne({ title });
      if (!brand) {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
      } else {
        throw new Error("Brand with same title already exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteBrand = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const deletedBrand = await Brand.findByIdAndDelete(id);
      if (deletedBrand) {
        const msg = `Brand ${id} deleted`;
        res.json({
          message: msg,
        });
      } else {
        throw new Error("No Brand found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const getBrand = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const findBrand  = await Brand.findById(id);
      if (findBrand) {
        res.json(findBrand);
      } else {
        throw new Error("No Brand found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

//get all Brands
const getallBrands = asyncHandler(async (req, res) => {
    try {
      const getallBrands = await Brand.find();
      res.json(getallBrands);
    } catch (error) {
      throw new Error(error);
    }
  });

  //update Brand
const updateBrand = asyncHandler(async (req, res) => {
    try {
      const id = req?.body?._id;
      validateMongoDbId(id);
      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        {
          title: req?.body?.title,
        },
        {
          new: true,
        }
      );
      if (updatedBrand) {
        res.json(updatedBrand);
      } else {
        throw new Error("No Brand found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });


  module.exports = {
    createBrand,
    deleteBrand,
    getBrand,
    updateBrand,
    getallBrands,
  };