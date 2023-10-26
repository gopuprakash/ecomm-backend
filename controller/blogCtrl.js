const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");


//create product

const createBlog = asyncHandler(async (req, res) => {
    try {
      const blogTitle = req.body.blogTitle;
      const blog = await Blog.findOne( {blogTitle} );
      if (!blog) {
        //create blog
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
      } else {
        throw new Error("Blog with same title already exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  module.exports = {
    createBlog,
  };