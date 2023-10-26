const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    productid: {
      type: String,
      required: true,
      index: true,
    },
    title: {
        type: String,
        required: true,
        index: true,
        trim: true,
      },
    masterProductid: {
      type: String,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    longdescription: {
      type: String,
    },
    state: {
      type: String,
      required: true,
      enum: ["Active", "Suspended", "Discontinued"],
    },
    producttype: {
      type: String,
      enum: ["Regular", "BundleParent", "BundleChild", "Master", "Template", "Electronic"],
    },
    uom: {
      type: String,
    },
    mrp: {
      type: Number,
      required: true,
    },
    sellingprice: {
      type: Number,
      required: true,
    },
    merchandisingcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    navigationcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    invavailability: {
      type: Number,
      required: true,
      default: 0,
    },
    invonorder: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: Array,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    brand: {
      type: String,
    },
    overallrating: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
