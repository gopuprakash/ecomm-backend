const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");
const slugify = require("slugify");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

//create product

const createProduct = asyncHandler(async (req, res) => {
  try {
    const productid = req.body.productid;
    const findProduct = await Product.findOne({ productid });
    if (!findProduct) {
      //create product
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } else {
      throw new Error("Product already exists");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//delete product

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (deletedProduct) {
      const msg = `Product ${id} deleted`;
        res.json({
          message: msg,
        });
    } else {
      throw new Error("No product found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get a product using id
const getProduct = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const findProduct = await Product.findById(id);
    if (findProduct) {
      res.json(findProduct);
    } else {
      throw new Error("No product found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get products
const getallProducts = asyncHandler(async (req, res) => {
  try {
    //Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];

    excludeFields.forEach((el) => delete queryObj[el]);

    let qryStr = JSON.stringify(queryObj);
    qryStr = qryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(qryStr));

    //Sorting

    if (req.query.sort) {
        let sortby = req.query.sort.split(',').join(' ');
        query = query.sort(sortby);
    } else {
        query = query.sort('-createdAt');
    }

    // limiting the fields

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("Page does not exist");
    }
    const product = await query;

    //const getProducts = await Product.find( queryObj );

    res.json(product);
  } catch (error) {
    throw error;
  }
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    } else {
        if(req.body.slug) delete req.body.slug;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productid: req?.body?.productid,
        title: req?.body?.title,
        masterProductid: req?.body?.masterProductid,
        slug: req?.body?.slug,
        description: req?.body?.description,
        longdescription: req?.body?.longdescription,
        state: req?.body?.state,
        producttype: req?.body?.producttype,
        uom: req?.body?.uom,
        mrp: req?.body?.mrp,
        sellingprice: req?.body?.sellingprice,
        invavailability: req?.body?.invavailability,
        invonorder: req?.body?.invonorder,
        color: req?.body?.color,
        size: req?.body?.size,
        brand: req?.body?.brand,
        overallrating: req?.body?.overallrating,
      },
      {
        new: true, runValidators: true
      }
    );
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      throw new Error("No product found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyAdded) {
      const usr = await User.findByIdAndUpdate(
        _id, 
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(usr);
    } else {
      const usr = await User.findByIdAndUpdate(
        _id, 
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(usr);
    }
  } catch (error) {
    throw error;
  }

});

const rateProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (rating) => rating?.postedBy?.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    console.log(`ratingsum: ${ratingsum} | totalRating: ${totalRating} | actualRating: ${actualRating}`);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        overallrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw error;
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

    const findProduct = await Product.findByIdAndUpdate(
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

    res.json(findProduct);
    
  } catch (error) {
    //throw new Error(error);
    throw error;
    
  }
});



module.exports = {
  createProduct,
  deleteProduct,
  getallProducts,
  getProduct,
  updateProduct,
  addToWishlist,
  rateProduct,
  uploadImages,
};
