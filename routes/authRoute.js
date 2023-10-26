const express = require("express");
const {
  createUser,
  loginUserCtrl,
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
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { handle } = require("express/lib/application");
const router = express.Router();

router.post("/register", createUser);
router.post("/register-admin", authMiddleware, isAdmin, createAdmin);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.post("/login", loginUserCtrl);
router.post("/logout", logoutUser);
router.get("/all-users", authMiddleware, isAdmin, getallUsers);
router.get("/refresh-token", handleRefreshToken);
router.get("/:_id", authMiddleware, isAdmin, getUser);
router.delete("/:_id", authMiddleware, isAdmin, deleteUser);
router.put("/update-user", authMiddleware, updateUser);
router.put("/update-password", authMiddleware, changePassword);
router.put("/block-user/:_id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:_id", authMiddleware, isAdmin, unblockUser);
router.put("/admin-update-user", authMiddleware, isAdmin, adminUpdateUser);


module.exports = router;
