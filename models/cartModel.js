const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        lineNo: Number,
        lineType: String,
        lineCharges: Number,
        lineDiscounts: Number,
        unitPrice: Number,
        quantity: Number,
        lineSubTotal: Number,
        tax: Number,
        lineTotal: Number,
        promisedShipDate: Date,
        promisedDeliveryDate: Date,
        shippingService: String,
      },
    ],
    productsNoInv: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        lineNo: Number,
        quantity: Number,
      }
    ],
    coupons: [
      {
        name: String,
        desc: String,
        discount: Number,
        discountPercent: Number, 
      },
    ],
    cartSubTotal: Number,
    cartDiscounts: Number, 
    cartCharges: Number,
    cartTotal: Number,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Cart", cartSchema);