import User from '../../models/User.js'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import {
  managerCreationValidation,
  managerUpdateValidation,
} from '../../validators/authValidator.js'

export const listUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query

    const filter = { role: 'user' }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ]
    }

    const pageNumber = parseInt(page, 10) || 1
    const pageSize = parseInt(limit, 10) || 10
    const skip = (pageNumber - 1) * pageSize

    const users = await User.find(filter)
      .populate({
        path: 'role',
        match: { name: 'user' },
      })
      .populate({
        path: 'tier',
        select: 'name',
      })
      .skip(skip)
      .limit(pageSize)
      .exec()

    const totalUsers = await User.countDocuments({
      ...filter,
      'role.name': 'user',
    })

    const filteredUsers = users.filter((manager) => manager.role)

    res.status(StatusCodes.OK).json({
      total: filteredUsers.length,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: pageNumber,
      users: filteredUsers,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching users.',
      error: error.message,
    })
  }
}

export const createUser = async (req, res) => {
  const { errors } = managerCreationValidation(req.body)

  if (errors)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: errors.details[0].message })

  const { name, email, phoneNumber, status } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash('User@123', 10)

    const newUser = new User({
      name,
      email,
      phoneNumber,
      status,
      role: 'user',
      password: hashedPassword,
    })

    const savedUser = await newUser.save()

    res.status(201).json({
      message: 'User created successfully',
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
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUser = async (req, res) => {
  const { name, email, phoneNumber, status } = req.body
  const managerId = req.params.id
  console.log('🚀  managerId  🚀', managerId)

  try {
    const manager = await User.findById(managerId)
    if (!manager) {
      return res.status(404).json({ message: 'Manager does not exist.' })
    }

    manager.name = name || manager.name
    manager.email = email || manager.email
    manager.phoneNumber = phoneNumber || manager.phoneNumber
    manager.status = status || manager.status

    await manager.save()

    res.status(200).json({
      message: 'Manager updated successfully!',
      manager: {
        name: manager.name,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        status: manager.status,
        role: manager.role,
        permissions: manager.permissions,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error!', error: err.message })
  }
}

export const changeUserStatus = async (req, res) => {
  const { status } = req.body
  const managerId = req.params.id

  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({
      message: 'Invalid status. Please select "active" or "inactive".',
    })
  }

  try {
    const manager = await User.findById(managerId)
    if (!manager) {
      return res.status(404).json({ message: 'Manager does not exist.' })
    }

    manager.status = status

    await manager.save()

    res.status(200).json({
      message: 'Manager status updated successfully!',
      manager: {
        name: manager.name,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        status: manager.status,
        permissions: manager.permissions,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error!', error: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findOneAndDelete({
      _id: userId,
      role: 'user',
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId).populate({
      path: 'role',
      match: { name: 'user' },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.status(StatusCodes.OK).json({
      message: 'User details fetched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching user details.',
      error: error.message,
    })
  }
}
