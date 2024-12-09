import bcrypt from 'bcryptjs'
import User from '../../models/User.js'
import {
  loginValidation,
  registerValidation,
} from '../../validators/authValidator.js'
import dotenv from 'dotenv'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider,
  REFRESH_TOKEN_SECRET_SIGNATURE,
} from '../../providers/JwtProvider.js'
import { StatusCodes } from 'http-status-codes'
import Permission from '../../models/Permission.js'
import { uploadImagesToCloudinary } from '../../ultils/upload.js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

dotenv.config()

export const register = async (req, res) => {
  const { error } = registerValidation(req.body)
  if (error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message })

  const { name, email, password, address } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Email này đã được sử dụng.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const userInfo = {
    name,
    email,
    password: hashedPassword,
    address,
  }
  const newUser = new User(userInfo)
  await newUser.save()

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

  newUser.refreshToken = refreshToken
  await newUser.save()

  res.cookie('refreshToken', refreshToken, { httpOnly: true })
  res.json({ accessToken })
}

export const login = async (req, res) => {
  try {
    const { error } = loginValidation(req.body)
    if (error)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.details[0].message })

    const { email, password } = req.body
    const user = await User.findOne({ email }).populate('permissions')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: 'Email hoặc mật khẩu không chính xác.' })
    }
    const permissions = user.permissions.map((perm) => perm.name)
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions,
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

export const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken
  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Refresh token required.' })
  }

  try {
    const refreshTokenDecoded = await JWTProvider.verifyToken(
      refreshToken,
      REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const user = await User.findOne({ _id: refreshTokenDecoded.id }).populate(
      'permissions'
    )
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token.' })
    }
    const permissions = user.permissions.map((perm) => perm.name)
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions,
    }

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '5m'
    )

    return res.status(StatusCodes.OK).json({ accessToken })
  } catch {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to refresh token!' })
  }
}

export const getPermissionsList = async (req, res) => {
  const { search = '' } = req.query

  try {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {}
    const permissions = await Permission.find(filter)
    const total = await Permission.countDocuments(filter)

    res.json({
      items: permissions,
      total,
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getProfile = async (req, res) => {
  const userId = req?.userInfo?.id
  try {
    const user = await User.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const changeAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadedImageUrls = await uploadImagesToCloudinary([req.file])

    const userId = req.userInfo.id

    await User.findByIdAndUpdate(
      userId,
      { avatar: uploadedImageUrls[0] },
      { new: true }
    )

    return res.status(200).json({
      message: 'Avatar and other images updated successfully',
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to update avatar', details: error.message })
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Email không tồn tại!' })
    }

    // Tạo resetToken và set thời gian hết hạn
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiration = Date.now() + 3600000 // Token hết hạn sau 1 giờ

    // Cập nhật token vào cơ sở dữ liệu
    user.resetToken = resetToken
    user.resetTokenExpiration = resetTokenExpiration
    await user.save()

    // Gửi email với reset link
    const resetLink = `${process.env.FRONTEND_URL}/v1/auth/reset-password?token=${resetToken}`
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset mật khẩu của bạn',
      text: `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào liên kết sau để đặt lại mật khẩu: ${resetLink}`,
    }

    await transporter.sendMail(mailOptions)

    res
      .status(StatusCodes.OK)
      .json({ message: 'Email reset password đã được gửi!' })
  } catch (error) {
    console.error(error)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Có lỗi xảy ra!' })
  }
}

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body

  try {
    // Tìm người dùng theo resetToken
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, // Kiểm tra token còn hạn không
    })

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Token không hợp lệ hoặc đã hết hạn!' })
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Cập nhật mật khẩu và xoá token
    user.password = hashedPassword
    user.resetToken = null
    user.resetTokenExpiration = null
    await user.save()

    res
      .status(StatusCodes.OK)
      .json({ message: 'Mật khẩu đã được thay đổi thành công!' })
  } catch (error) {
    console.error(error)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Có lỗi xảy ra!' })
  }
}
