const BlogCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");


//create blog category

const createBlogCategory = asyncHandler(async (req, res) => {
    try {
      const { title } = req.body;
      const blogCategory = await BlogCategory.findOne({ title });
      if (!blogCategory) {
        const newBC = await BlogCategory.create(req.body);
        res.json(newBC);
      } else {
        throw new Error("Blog Category with same title already exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteBlogCategory = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const deletedBC = await BlogCategory.findByIdAndDelete(id);
      if (deletedBC) {
        const msg = `Blog Category ${id} deleted`;
        res.json({
          message: msg,
        });
      } else {
        throw new Error("No BlogCategory found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const getBlogCategory = asyncHandler(async (req, res) => {
    try {
      const id = req.params._id;
      validateMongoDbId(id);
      const findBlogCategory  = await BlogCategory.findById(id);
      if (findBlogCategory) {
        res.json(findBlogCategory);
      } else {
        throw new Error("No Blog Category found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

//get all Blog Categories
const getallBlogCategories = asyncHandler(async (req, res) => {
    try {
      const getallBlogCategories = await BlogCategory.find();
      res.json(getallBlogCategories);
    } catch (error) {
      throw new Error(error);
    }
  });

  //update blog category
const updateBlogCategory = asyncHandler(async (req, res) => {
    try {
      const id = req?.body?._id;
      validateMongoDbId(id);
      const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(
        id,
        {
          title: req?.body?.title,
        },
        {
          new: true,
        }
      );
      if (updatedBlogCategory) {
        res.json(updatedBlogCategory);
      } else {
        throw new Error("No Blog Category found for id");
      }
    } catch (error) {
      throw new Error(error);
    }
  });


  module.exports = {
    createBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
    updateBlogCategory,
    getallBlogCategories,
  };