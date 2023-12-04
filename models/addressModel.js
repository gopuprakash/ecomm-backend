const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    addresstype: {
      type: String,
      required: true,
      enum: ["Shipping", "Billing"],
    },
    addresstag: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    addressline1: {
      type: String,
    },
    addressline2: {
      type: String,
    },
    addressline3: {
      type: String,
    },
    addressline4: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    country: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Address", addressSchema);
