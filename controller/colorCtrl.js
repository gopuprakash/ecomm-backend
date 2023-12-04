const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");


//create Color

const createColor = asyncHandler(async (req, res) => {
    try {
      const { title } = req.body;
      const color = await Color.findOne({ title });
      if (!color) {
        const newColor = await Color.create(req.body);
        res.json(newColor);
      } else {
        throw new Error("Color with same title already exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteColor = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const deletedColor = await Color.findByIdAndDelete(id);
      if (deletedColor) {
        const msg = `Color ${id} deleted`;
        res.json({
          message: msg,
        });
      } else {
        throw new Error("No Color found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const getColor = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const findColor  = await Color.findById(id);
      if (findColor) {
        res.json(findColor);
      } else {
        throw new Error("No Color found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

//get all Colors
const getallColors = asyncHandler(async (req, res) => {
    try {
      const getallColors = await Color.find();
      res.json(getallColors);
    } catch (error) {
      throw new Error(error);
    }
  });

  //update Color
const updateColor = asyncHandler(async (req, res) => {
    try {
      const id = req?.body?._id;
      validateMongoDbId(id);
      const updatedColor = await Color.findByIdAndUpdate(
        id,
        {
          title: req?.body?.title,
        },
        {
          new: true,
        }
      );
      if (updatedColor) {
        res.json(updatedColor);
      } else {
        throw new Error("No Color found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });


  module.exports = {
    createColor,
    deleteColor,
    getColor,
    updateColor,
    getallColors,
  };