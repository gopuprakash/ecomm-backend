const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWSECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error("Not Authorised/Token Expired. Please login again")
        }
    } else {
        throw new Error("No token in the header")
    }
})

const isAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "Admin"){
        throw new Error ("You are not an Admin");
    } else {
        next();
    }

})

module.exports = { authMiddleware, isAdmin };
