const ProdCategory = require("../models/prodCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");


//create prodf category

const createProdCategory = asyncHandler(async (req, res) => {
    try {
      const { title } = req.body;
      const prodCategory = await ProdCategory.findOne({ title });
      if (!prodCategory) {
        const newPC = await ProdCategory.create(req.body);
        res.json(newPC);
      } else {
        throw new Error("Prod Category with same title already exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteProdCategory = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const deletedPC = await ProdCategory.findByIdAndDelete(id);
      if (deletedPC) {
        const msg = `Prod Category ${id} deleted`;
        res.json({
          message: msg,
        });
      } else {
        throw new Error("No ProdCategory found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const getProdCategory = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const findProdCategory  = await ProdCategory.findById(id);
      if (findProdCategory) {
        res.json(findProdCategory);
      } else {
        throw new Error("No Prod Category found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

//get all ProdCategories
const getallProdCategories = asyncHandler(async (req, res) => {
    try {
      const getallProdCategories = await ProdCategory.find();
      res.json(getallProdCategories);
    } catch (error) {
      throw new Error(error);
    }
  });

  //update product
const updateProdCategory = asyncHandler(async (req, res) => {
    try {
      const id = req?.body?._id;
      validateMongoDbId(id);
      const updatedProdCategory = await ProdCategory.findByIdAndUpdate(
        id,
        {
          title: req?.body?.title,
        },
        {
          new: true,
        }
      );
      if (updatedProdCategory) {
        res.json(updatedProdCategory);
      } else {
        throw new Error("No Prod Category found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });


  module.exports = {
    createProdCategory,
    deleteProdCategory,
    getProdCategory,
    updateProdCategory,
    getallProdCategories,
  };