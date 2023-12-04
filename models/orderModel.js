const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
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
        quantity: Number,
        lineSubTotal: Number,
        tax: Number,
        lineTotal: Number,
        promisedShipDate: Date,
        promisedDeliveryDate: Date,
        shippingService: String,
      },
    ],
    coupons: [
      {
        name: String,
        desc: String,
        discount: Number,
      },
    ],
    paymentIntent: {},
    orderstatus: {
      type: String,
      required: true,
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Shipped",
        "Cancelled",
        "Delivered"
      ],
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    billingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderSubTotal: Number,
    shippingCharges: Number,
    orderCharges: Number,
    orderDiscounts: Number,
    orderTotal: Number,
    orderNo: String,
    orderType: String,
    orderDate: Date,
    promisedShipDate: Date,
    promisedDeliveryDate: Date,
    shippingService: String,
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
