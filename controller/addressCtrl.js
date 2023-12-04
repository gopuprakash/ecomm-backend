const Address = require("../models/addressModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");

//create Address

const createAddress = asyncHandler(async (req, res) => {
  try {
    const newAddress = await Address.create(req.body);
    res.json(newAddress);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const deletedAddress = await Address.findByIdAndDelete(id);
    if (deletedAddress) {
      const msg = `Address ${id} deleted`;
      res.json({
        message: msg,
      });
    } else {
      throw new Error("No Address found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getAddress = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const findAddress = await Address.findById(id);
    if (findAddress) {
      res.json(findAddress);
    } else {
      throw new Error("No Address found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//get all Addresses
const getallAddresses = asyncHandler(async (req, res) => {
  try {
    const getallAddresss = await Address.find();
    res.json(getallAddresss);
  } catch (error) {
    throw new Error(error);
  }
});

//update Address
const updateAddress = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        name: req?.body?.name,
        addresstype: req?.body?.addresstype,
        buildingtype: req?.body?.buildingtype,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        addressline1: req?.body?.addressline1,
        addressline2: req?.body?.addressline2,
        addressline3: req?.body?.addressline3,
        addressline4: req?.body?.addressline4,
        city: req?.body?.city,
        state: req?.body?.state,
        zipcode: req?.body?.zipcode,
        country: req?.body?.country,
        latitude: req?.body?.latitude,
        longitude: req?.body?.longitude,
      },
      {
        new: true,
      }
    );
    if (updatedAddress) {
      res.json(updatedAddress);
    } else {
      throw new Error("No Address found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createAddress,
  deleteAddress,
  getAddress,
  updateAddress,
  getallAddresses,
};
