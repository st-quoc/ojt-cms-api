import bcrypt from 'bcryptjs'
import User from '../../models/User.js'
import {
  JWTProvider,
  ACCESS_TOKEN_SECRET_SIGNATURE,
  REFRESH_TOKEN_SECRET_SIGNATURE,
} from '../../providers/JwtProvider.js'

/**
 * Đăng ký người dùng mới
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body

    // Kiểm tra email
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' })
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // Gán vai trò mặc định nếu không cung cấp
    const userRole = role || 'user'

    // Tạo người dùng mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address: address || '', // Nếu không có địa chỉ, đặt giá trị mặc định là chuỗi rỗng
      role: userRole,
      status: 'active', // Người dùng mới luôn có trạng thái 'active'
    })

    await newUser.save()

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

/**
 * Đăng nhập người dùng
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Kiểm tra email và mật khẩu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' })
    }

    // Tìm người dùng bằng email
    const user = await User.findOne({ email }).populate('permissions')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Kiểm tra trạng thái người dùng
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' })
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Tạo Access Token và Refresh Token
    const accessToken = await JWTProvider.generateToken(
      { id: user._id, role: user.role },
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '15m'
    )

    const refreshToken = await JWTProvider.generateToken(
      { id: user._id },
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '7d'
    )

    // Lưu Refresh Token vào cơ sở dữ liệu
    user.refreshToken = refreshToken
    await user.save()

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
