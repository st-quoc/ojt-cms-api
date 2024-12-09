import { StatusCodes } from 'http-status-codes'
import User from '../../models/User.js'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider,
  REFRESH_TOKEN_SECRET_SIGNATURE,
} from '../../providers/JwtProvider.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import Cart from '../../models/Cart.js'

export const register = async (req, res) => {
  const { name, email, phoneNumber, password, confirmPassword } = req.body

  if (!name || !email || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      phoneNumber,
      status: 'inactive',
      role: 'user',
      password: hashedPassword,
    })

    const savedUser = await newUser.save()
    const newCart = new Cart({
      userId: savedUser._id,
      items: [],
    })

    await newCart.save()

    res.status(201).json({
      message:
        'User created successfully. Please check your email to confirm your account.',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        status: savedUser.status,
        role: savedUser.role,
      },
    })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: 'Email hoặc mật khẩu không chính xác.' })
    }
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
    }

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '5m'
    )

    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
    )

    user.accessToken = accessToken
    user.refreshToken = refreshToken
    await user.save()

    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}
