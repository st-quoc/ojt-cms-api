import User from '../../models/User.js'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { managerCreationValidation } from '../../validators/authValidator.js'
import Permission from '../../models/Permission.js'

export const listManager = async (req, res) => {
  try {
    const { search, permission, page = 1, limit = 10 } = req.query

    const filter = { role: 'manager' }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ]
    }

    if (permission) {
      filter['permissions'] = { $in: [permission] }
    }

    const pageNumber = parseInt(page, 10) || 1
    const pageSize = parseInt(limit, 10) || 10
    const skip = (pageNumber - 1) * pageSize

    const managers = await User.find(filter)
      .populate({
        path: 'role',
        match: { name: 'manager' },
        populate: {
          path: 'permissions',
          match: permission ? { name: permission } : {},
          select: 'name description',
        },
      })
      .skip(skip)
      .limit(pageSize)
      .exec()

    const totalManagers = await User.countDocuments({
      ...filter,
      'role.name': 'manager',
    })

    const filteredManagers = managers.filter((manager) => manager.role)

    res.status(StatusCodes.OK).json({
      total: filteredManagers.length,
      totalPages: Math.ceil(totalManagers / pageSize),
      currentPage: pageNumber,
      managers: filteredManagers,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching managers.',
      error: error.message,
    })
  }
}

export const createManager = async (req, res) => {
  const { errors } = managerCreationValidation(req.body)

  if (errors)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: errors.details[0].message })

  const { name, email, phoneNumber, status, permissions } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const validPermissions = await Permission.find({
      _id: { $in: permissions },
    })

    if (validPermissions.length !== permissions.length) {
      return res.status(400).json({ message: 'Some permissions are invalid' })
    }

    const hashedPassword = await bcrypt.hash('Manager@123', 10)

    const newUser = new User({
      name,
      email,
      phoneNumber,
      status,
      role: 'manager',
      permissions,
      password: hashedPassword,
    })

    const savedUser = await newUser.save()

    res.status(201).json({
      message: 'Manager created successfully',
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        status: savedUser.status,
        role: savedUser.role,
        permissions: savedUser.permissions,
      },
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateManager = async (req, res) => {
  const { name, email, phoneNumber, status, permissions } = req.body
  const managerId = req.params.id

  try {
    const manager = await User.findById(managerId)
    if (!manager) {
      return res.status(404).json({ message: 'Manager does not exist.' })
    }

    manager.name = name || manager.name
    manager.email = email || manager.email
    manager.phoneNumber = phoneNumber || manager.phoneNumber
    manager.status = status || manager.status
    manager.permissions = permissions || manager.permissions

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

export const changeManagerStatus = async (req, res) => {
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

export const deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params

    if (!managerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Manager ID is required.',
      })
    }

    const manager = await User.findOneAndDelete({
      _id: managerId,
      role: await Role.findOne({ name: 'manager' })._id,
    })

    if (!manager) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Manager not found.',
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'Manager deleted successfully.',
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting manager.',
      error: error.message,
    })
  }
}

export const getManagerDetail = async (req, res) => {
  try {
    const managerId = req.params.id

    const manager = await User.findById(managerId).populate({
      path: 'permissions',
      select: 'name description',
    })

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found.' })
    }

    res.status(StatusCodes.OK).json({
      message: 'Manager details fetched successfully',
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        status: manager.status,
        role: manager.role,
        permissions:
          manager.permissions.map((permission) => permission._id) || [],
        createdAt: manager.createdAt,
        updatedAt: manager.updatedAt,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching manager details.',
      error: error.message,
    })
  }
}
