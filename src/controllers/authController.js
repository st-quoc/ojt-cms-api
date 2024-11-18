const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  loginValidation,
  registerValidation,
} = require("../validators/authValidator");
require("dotenv").config();

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password, address } = req.body;

  // Kiểm tra email đã tồn tại
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email này đã được sử dụng." });
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo người dùng mới
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    address,
  });

  await newUser.save();

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res.cookie("refreshToken", refreshToken, { httpOnly: true });
  res.json({ accessToken });
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("role");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ message: "Email hoặc mật khẩu không chính xác." });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, { httpOnly: true });
  res.json({ accessToken });
};

// Cấp lại access token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required." });

  const user = await User.findOne({ refreshToken });
  if (!user) return res.status(403).json({ message: "Invalid refresh token." });

  try {
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token." });
  }
};
