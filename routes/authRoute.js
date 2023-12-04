const express = require("express");
const {
  createUser,
  loginUserCtrl,
  loginAdminCtrl,
  getallUsers,
  getUser,
  deleteUser,
  updateUser,
  createAdmin,
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
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { handle } = require("express/lib/application");
const router = express.Router();

router.post("/register", createUser);
router.post("/register-admin", authMiddleware, isAdmin, createAdmin);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdminCtrl);
router.post("/logout", logoutUser);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.get("/all-users", authMiddleware, isAdmin, getallUsers);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);
router.get("/refresh-token", handleRefreshToken);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:_id", authMiddleware, isAdmin, getUser);
router.post("/myprofile", authMiddleware, myProfile);
router.post("/get-wishlist", authMiddleware, getWishlist);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:_id", authMiddleware, isAdmin, deleteUser);
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);
router.put("/update-user", authMiddleware, updateUser);
router.put("/update-password", authMiddleware, changePassword);
router.put("/block-user/:_id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:_id", authMiddleware, isAdmin, unblockUser);
router.put("/admin-update-user", authMiddleware, isAdmin, adminUpdateUser);
router.put("/save-address", authMiddleware, saveAddress);


module.exports = router;
