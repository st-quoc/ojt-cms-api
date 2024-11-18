const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
require("dotenv").config();

exports.verifyAccessToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findById(req.user.id).populate({
      path: "role",
      populate: { path: "permissions" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.role) {
      return res.status(403).json({ message: "User has no Assigned Role!" });
    }

    if (!user.role.permissions) {
      return res.status(403).json({ message: "Role has no Permissions!" });
    }

    req.user.role = user.role;
    req.user.permissions = user.role.permissions.map((p) => p.name);

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ message: "Invalid or Expired Access Token" });
  }
};

// Middleware kiểm tra quyền
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Middleware kiểm tra vai trò (role)
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role.name !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
