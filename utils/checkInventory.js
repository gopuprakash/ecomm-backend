const Product = require("../models/productModel");

const getAvailability = async (productId, quantity) => {
    const product = await Product.findById(productId);
    const availabilty = parseInt(product.invavailability ?? 0) - parseInt(product.invonorder ?? 0)

    if (availabilty >= quantity) {
        return true;
    } else {
        return false;
    }
  };
  
  module.exports = { getAvailability };