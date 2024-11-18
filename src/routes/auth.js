const express = require("express");
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController");
const {
  verifyAccessToken,
  requirePermission,
  requireRole,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected route chỉ cho người dùng có vai trò 'admin'
router.get("/admin", verifyAccessToken, requireRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Protected route yêu cầu quyền 'manage_products'
router.get(
  "/products",
  verifyAccessToken,
  requirePermission("manage_products"),
  (req, res) => {
    res.json({ message: "Access granted to manage products" });
  }
);

module.exports = router;
