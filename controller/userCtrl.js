//const req = require("express/lib/request")
const { request } = require("express");
const { generateToken } = require("../config/jwToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");

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
    console.log(req.body);
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
    }

    sendEmail(data);
    res.json(token);
  } catch (error) { 
    throw error;
  }
});

const resetPassword = asyncHandler( async(req, res) => {
  //const { password } = req?.body;
  //console.log(`Password: ${password}`);
  const { token } = req?.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
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

module.exports = {
  createUser,
  createAdmin,
  loginUserCtrl,
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
};
