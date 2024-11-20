import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import {
  loginValidation,
  registerValidation,
} from '../../validators/authValidator.js';
import dotenv from 'dotenv';
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider,
  REFRESH_TOKEN_SECRET_SIGNATURE,
} from '../../providers/JwtProvider.js';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

export const register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });

  const { name, email, password, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Email này đã được sử dụng.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userInfo = {
    name,
    email,
    password: hashedPassword,
    address,
  };
  const newUser = new User(userInfo);
  await newUser.save();

  const accessToken = await JWTProvider.generateToken(
    userInfo,
    ACCESS_TOKEN_SECRET_SIGNATURE,
    '1h'
  );

  const refreshToken = await JWTProvider.generateToken(
    userInfo,
    REFRESH_TOKEN_SECRET_SIGNATURE,
    '14 days'
  );

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.json({ accessToken });
};

export const login = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    );

    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
    );

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Refresh token required.' });
  }

  try {
    const refreshTokenDecoded = await JWTProvider.verifyToken(
      refreshToken,
      REFRESH_TOKEN_SECRET_SIGNATURE
    );

    const user = await User.findOne({ _id: refreshTokenDecoded.id });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    );

    return res.status(StatusCodes.OK).json({ accessToken });
  } catch (err) {
    console.log(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to refresh token!' });
  }
};
