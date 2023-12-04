const Blog = require("../models/blogModel");
//const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

//create blog

const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    const blog = await Blog.findOne({ title });
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

//delete product

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (deletedBlog) {
      const msg = `Blog ${id} deleted`;
      res.json({
        message: msg,
      });
    } else {
      throw new Error("No Blog found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get a blog using id
const getBlog = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const loginUserId = req?.user?._id;
    const findBlog = await Blog.findById(id)
      .populate("likes")
      .populate("dislikes");
    if (findBlog) {
      // find if the user has disliked the blog
      const alreadyLiked = findBlog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
      );
      // find if the user has disliked the blog
      const alreadyDisliked = findBlog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
      );
      if (alreadyLiked) {
        findBlog.isLiked = true;
      }
      if (alreadyDisliked) {
        findBlog.isDisliked = true;
      }
      const updateViews = await Blog.findByIdAndUpdate(
        id,
        {
          $inc: { numViews: 1 },
        },
        {
          new: true,
        }
      );
      res.json(findBlog);
    } else {
      throw new Error("No Blog found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get blogs
const getallBlogs = asyncHandler(async (req, res) => {
  try {
    //Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];

    excludeFields.forEach((el) => delete queryObj[el]);

    let qryStr = JSON.stringify(queryObj);
    qryStr = qryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Blog.find(JSON.parse(qryStr));

    //Sorting

    if (req.query.sort) {
      let sortby = req.query.sort.split(",").join(" ");
      query = query.sort(sortby);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    //console.log(page, limit, skip);

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const blogCount = await Blog.countDocuments();
      if (skip >= blogCount) throw new Error("Page does not exist");
    }
    const blogs = await query;

    res.json(blogs);
  } catch (error) {
    throw error;
  }
});

//update a blog
const updateBlog = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
        description: req?.body?.description,
        category: req?.body?.category,
        numViews: req?.body?.numViews,
        likes: req?.body?.likes,
        dislikes: req?.body?.dislikes,
        image: req?.body?.image,
        auther: req?.body?.auther,
      },
      {
        new: true,
      }
    );
    if (updatedBlog) {
      res.json(updatedBlog);
    } else {
      throw new Error("No blog found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const blog = await Blog.findById(id);
    const loginUserId = req?.user?._id;

    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    // find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      // if the user has disliked the blog. liking it will remove the dislike
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
    }
    if (alreadyLiked) {
      // If the user has already liked it, then clicking on like will remove the like
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      // If the user has not liked it, then clicking on like means exactly that
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const blog = await Blog.findById(id);
    const loginUserId = req?.user?._id;
    // find if the user has liked the blog
    //const isLiked = blog?.isLiked;
    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    // find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyLiked) {
      // if the user has liked the blog. disliking it will remove the like
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
    }
    if (alreadyDisliked) {
      // If the user has already disliked it, then clicking on dislike will remove the dislike
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      // If the user has not already disliked it, then clicking on dislike means exaactly that
      const blog = await Blog.findByIdAndUpdate(
        id,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path);

    const urls = [];
    const files = req.files;
    for (let file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath.url);
      fs.unlinkSync(path);
    }

    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );

    res.json(findBlog);
  } catch (error) {
    //throw new Error(error);
    throw error;
  }
});

module.exports = {
  createBlog,
  deleteBlog,
  getBlog,
  updateBlog,
  getallBlogs,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
