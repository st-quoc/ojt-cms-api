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
import crypto from 'crypto'
import nodemailer from 'nodemailer'

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
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

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

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body

  try {
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ message: 'Password changed successfully' })
  } catch {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const changeProfile = async (req, res) => {
  const { id } = req.userInfo
  const { name, email, address, phone, avatar } = req.body

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' })
      }
    }

    user.name = name || user.name
    user.email = email || user.email
    user.address = address || user.address
    user.phone = phone || user.phone
    user.avatar = avatar || user.avatar

    await user.save()

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
  } catch {
    res
      .status(500)
      .json({ message: 'An error occurred while updating profile' })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const { id } = req.userInfo

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.status !== 'active') {
      return res
        .status(400)
        .json({ message: 'Inactive user cannot reset password' })
    }

    if (id) {
      const auth = await User.findById(id)
      if (!auth) {
        return res.status(403).json({ message: 'Unauthorized request' })
      }

      if (auth.id !== user.id) {
        return res
          .status(403)
          .json({ message: 'Mismatch between user and token' })
      }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.resetPassword = {
      token: hashedToken,
      expiresAt: Date.now() + 3600000,
    }
    await user.save()

    let host = ''
    if (user.role === 'user') {
      host = process.env.FE_HOST_USER
    } else {
      host = process.env.FE_HOST_ADMIN
    }

    const resetLink = `${host}/reset-password/${resetToken}`
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:
      \n\n${resetLink}\n\n
      If you did not request this, please ignore this email.`,
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({ message: 'Password reset email sent' })
  } catch {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword } = req.body

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ 'resetPassword.token': hashedToken })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    if (user.resetPassword.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' })
    }

    user.password = newPassword
    user.resetPassword = {}

    await user.save()

    return res
      .status(200)
      .json({ message: 'Password has been successfully changed' })
  } catch {
    return res
      .status(500)
      .json({ message: 'An error occurred while processing the request' })
  }
}

export const resetPasswordForUser = async (req, res) => {
  try {
    const { userId, newPassword } = req.body

    if (!req.userInfo || req.userInfo.role !== 'admin') {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Access denied' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    await user.save()

    res.status(StatusCodes.OK).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error resetting password',
      error: error.message,
    })
  }
}
