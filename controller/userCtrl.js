//const req = require("express/lib/request")
const { request } = require("express");
const { generateToken } = require("../config/jwToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const { getNextSequenceValue } = require("../utils/orderNoSeq");
const crypto = require("crypto");
const uniqid = require("uniqid");
const mongoose = require("mongoose");
const { getAvailability } = require("../utils/checkInventory");

//create user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    //create user
    req.body.role = "User";
    const newUser = await User.create(req.body);
    //res.json(newUser);
    res.json({
      _id: newUser?._id,
      firstname: newUser?.firstname,
      lastname: newUser?.lastname,
      email: newUser?.email,
      mobile: newUser?.mobile,
      role: newUser?.role,
      //token: generateToken(newUser?._id),
    });
  } else {
    throw new Error("User already exists");
  }
});

//create Admin
const createAdmin = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    //create user
    req.body.role = "Admin";
    const newUser = await User.create(req.body);
    //res.json(newUser);
    res.json({
      _id: newUser?._id,
      firstname: newUser?.firstname,
      lastname: newUser?.lastname,
      email: newUser?.email,
      mobile: newUser?.mobile,
      role: newUser?.role,
      //token: generateToken(newUser?._id),
    });
  } else {
    throw new Error("Admin User already exists");
  }
});

//login user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Check user
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      role: findUser?.role,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//login admin
const loginAdminCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Check user
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    if (findUser.role !== "Admin") throw new Error("Not Authorised");
    const refreshToken = generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      role: findUser?.role,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookies");

  const refreshToken = cookie.refreshToken;

  const user = await User.findOne({ refreshToken });
  console.log(`user.id: ${user.id}`);

  if (!user) throw new Error("No users with matching refresh token");

  const id = user.id;

  jwt.verify(refreshToken, process.env.JWSECRET, (err, decoded) => {
    if (err || id !== decoded.id) {
      throw new Error("Some wrong with the refresh token");
    }
    const accessToken = generateToken(id);
    res.json({ accessToken });
  });
});

// Logout functionality

const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
});

//get all users
const getallUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

//get a single user
const getUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const findUser = await User.findById(id);
    if (findUser) {
      res.json(findUser);
    } else {
      throw new Error("No user found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//update a single user. This code will update only the authenticated user details.
const updateUser = asyncHandler(async (req, res) => {
  try {
    const id = req?.user?.id;
    validateMongoDbId(id);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      throw new Error("No user found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  try {
    const id = req?.body?._id;
    validateMongoDbId(id);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        role: req?.body?.role,
        isblocked: req?.body?.isblocked,
      },
      {
        new: true,
      }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      throw new Error("No user found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const id = req.params._id;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isblocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new error();
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const id = req.params._id;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isblocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    throw new error();
  }
});

//Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params._id;
    validateMongoDbId(id);
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      res.json(deletedUser);
    } else {
      throw new Error("No user found for id");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//Change password. Has to be the authenticated user
const changePassword = asyncHandler(async (req, res) => {
  try {
    const id = req?.user?._id;
    validateMongoDbId(id);
    const oldpassword = req?.body?.oldpassword;

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    if (await user.isPasswordMatched(oldpassword)) {
      user.password = req?.body?.password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      throw new Error("Incorrect old password");
    }
  } catch (error) {
    throw error;
  }
});

// forgot passord token

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("No user registered with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Please <a href='http://localhost:5001/api/user/reset-password/${token}'>click here</a> to reset your password. This link is valid only for 30 minutes`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Reset your password",
      htm: resetURL,
    };

    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw error;
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  //const { password } = req?.body;
  //console.log(`Password: ${password}`);
  const { token } = req?.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Expired Token Please try again");
  //user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const myProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id)
      .populate("wishlist")
      .populate("address")
      .populate("cart")
      .populate("shippingaddress")
      .populate("billingaddress");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    addressType = req?.body?.addresstype;
    isDefault = req?.body?.isdefault;

    const newAddress = await Address.create(req?.body);
    addressId = newAddress._id;

    if (isDefault === true) {
      if (addressType === "Shipping") {
        const updatedUser = await User.findByIdAndUpdate(
          _id,
          {
            $push: { address: addressId },
            shippingaddress: addressId,
          },
          {
            new: true,
          }
        );
        res.json(updatedUser);
      } else if (addressType === "Billing") {
        const updatedUser = await User.findByIdAndUpdate(
          _id,
          {
            $push: { address: addressId },
            billingaddress: addressId,
          },
          {
            new: true,
          }
        );
        res.json(updatedUser);
      }
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          $push: { address: addressId },
        },
        {
          new: true,
        }
      );
      res.json(updatedUser);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    let products = [];
    let productsNoInv = [];
    const user = await User.findById(_id);
    // check if user already have products in cart
    const alreadyExistCart = await Cart.findOneAndDelete({
      customer: user._id,
    });
    if (alreadyExistCart) {
      console.log(`alreadyExistCart deleted: ${alreadyExistCart}`);
    }

    // Create an array to store the promises for fetching product details
    let fetchProductPromises = [];

    // Iterate over the cart array using a more efficient for...of loop
    for (const item of cart) {
      // Create an object to store the product details
      let invAvl = await getAvailability(item._id, item.quantity);
      console.log(`item._id: ${item._id}=${invAvl}`);
      if (invAvl) {
        const object = {
          product: { _id: item._id },
          quantity: item.quantity,
          lineNo: item.lineNo,
        };

        // Fetc h the product's selling price using findById().select().exec()
        const fetchProductPromise = Product.findById(item._id)
          .select("sellingprice")
          .exec();

        // Add the promise to the array
        fetchProductPromises.push(fetchProductPromise);

        // Push the object to the products array directly
        products.push(object);
      } else {
        const object = {
          product: { _id: item._id },
          quantity: item.quantity,
          lineNo: item.lineNo,
        };
        productsNoInv.push(object);
      }
    }

    if (products.length > 0) {
      // Wait for all the product fetch promises to resolve using Promise.all()
      const productResults = await Promise.all(fetchProductPromises);

      // Iterate over the product results and update the corresponding objects in the products array
      productResults.forEach((result, index) => {
        const getPrice = result;
        const object = products[index];

        // Update the object with the fetched product details
        object.unitPrice = getPrice.sellingprice;
        object.lineTotal = getPrice.sellingprice * object.quantity;
      });
    }

    let cartSubTotal = (products.reduce(
      (total, product) => total + product.lineTotal ?? 0,
      0
    ) ?? 0).toFixed(2);

    let cartTotal = cartSubTotal;

    let newCart = await new Cart({
      products,
      productsNoInv,
      cartSubTotal,
      cartTotal,
      customer: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw error;
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const cart = await Cart.findOne({ customer: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const cart = await Cart.findOneAndRemove({ customer: _id });
    if (cart) {
      res.json({
        message: `Cart ${cart._id} of customer ${_id} emptied`,
      });
    } else {
      throw new Error("Cart already empty");
    }
  } catch (error) {
    throw error;
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const maxCoupons = parseInt(process.env.MAX_CART_COUPONS);
  const { coupon } = req.body;
  const { _id } = req.user;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });

    if (validCoupon === null) {
      throw new Error("Invalid Coupon");
    }

    let currentDate = new Date();
    if (validCoupon.expiry.getTime() < currentDate.getTime()) {
      throw new Error("Coupon Expired");
    }

    const user = await User.findById(_id);
    const cart = await Cart.findOne({
      customer: user._id,
    });

    if (maxCoupons === parseInt(cart.coupons.length ?? 0)) {
      throw new Error("Max Coupon limit reached");
    }

    const result = cart.coupons.find(({ name }) => name === coupon);

    if (result) {
      throw new Error("Coupon already applied");
    }

    let cartTotal = parseFloat(cart.cartTotal);
    let cartSubTotal = parseFloat(cart.cartSubTotal);
    let cartDiscounts = parseFloat(cart.cartDiscounts ?? 0);

    let couponDiscount = parseFloat(
      (cartSubTotal * (parseFloat(validCoupon.discount) / 100)).toFixed(2)
    );
    cartTotal = parseFloat(cartTotal - couponDiscount);
    cartDiscounts = parseFloat(cartDiscounts + couponDiscount).toFixed(2);

    const newCart = await Cart.findOneAndUpdate(
      { customer: user._id },
      {
        cartTotal: cartTotal,
        cartDiscounts: cartDiscounts,
        $push: {
          coupons: {
            name: validCoupon.name,
            desc: validCoupon.desc,
            discountPercent: validCoupon.discount,
            discount: couponDiscount,
          }, 
        },
      },
      { new: true }
    );
    res.json(newCart);
  } catch (error) {
    throw error;
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    COD,
    shippingAddress,
    billingAddress,
    shippingService,
    promisedDeliveryDate,
    promisedShipDate,
  } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ customer: user._id });

    if (!userCart) throw new Error("Cart is empty");

    const products = userCart.products;
    const prodInvUnavl = [];

    for (const product of products) {
      // Create an object to store the product details
      let invAvl = await getAvailability(product.product._id, product.quantity);
      if (!invAvl) { 
        prodInvUnavl.push(product)
      } 
    } 

    if(prodInvUnavl.length > 0){

      console.log(prodInvUnavl);

      let invUnavailable = (prodInvUnavl.reduce(
        (string, product) => string + " | " + product.lineNo + " : " + product.product,
        "Inventory Unavailable: "
      ) ?? "");
      throw new Error(invUnavailable);
    }


    let cartTotal = userCart.cartTotal;

    let orderNo = await getNextSequenceValue("orderNoSequence");
    orderNo = "10" + String(orderNo).padStart(12, "0");

    //Create Order
    let newOrder = await Order.create({
      products: userCart.products,
      coupons: userCart.coupons,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      shippingService: shippingService,
      orderDate: Date.now(),
      orderNo: orderNo,
      orderType: "REGULAR",
      customer: user._id,
      orderstatus: "Not Processed",
      orderSubTotal: userCart.cartSubTotal,
      shippingCharges: 0,
      orderCharges: 0,
      orderDiscounts: userCart.cartDiscounts,
      orderTotal: cartTotal,
      promisedShipDate: promisedShipDate,
      promisedDeliveryDate: promisedDeliveryDate,
      shippingService: shippingService,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        orderNo: orderNo,
        amount: cartTotal,
        status: "Not Processed",
        created: Date.now().toString(),
        currency: "INR",
      },
    });

    //Retrieve Order with details
    const findOrder = await Order.findById(newOrder._id)
      .populate("shippingAddress")
      .populate("billingAddress")
      .populate("customer");

    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { invonorder: +item.quantity } },
        },
      };
    });

    //Update inventory
    const updated = await Product.bulkWrite(update, {});

    //Clear cart
    userCart = await Cart.findOneAndDelete({ customer: user._id });

    //throw new Error("Test");

    await session.commitTransaction();
    console.log("committed");
    res.json(findOrder);
  } catch (error) {
    //rollback on exception
    await session.abortTransaction();
    console.log("aborted");
    throw error;
  } finally {
    // End the session
    console.log("session ended");
    session.endSession();
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ customer: _id })
      .populate("products.product")
      .populate("customer")
      .populate("shippingAddress")
      .populate("billingAddress")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("customer")
      .populate("shippingAddress")
      .populate("billingAddress")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.find({ customer: id })
      .populate("products.product")
      .populate("customer")
      .populate("shippingAddress")
      .populate("billingAddress")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderstatus: status,
        /* paymentIntent: {
          status: status,
        }, */
      },
      { new: true, runValidators: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  createAdmin,
  loginUserCtrl,
  loginAdminCtrl,
  getallUsers,
  getUser,
  deleteUser,
  updateUser,
  changePassword,
  blockUser,
  unblockUser,
  adminUpdateUser,
  handleRefreshToken,
  logoutUser,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  myProfile,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
};
