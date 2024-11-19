import { User } from '~/models/User'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import Role from '~/models/Role'
import Permission from '~/models/Permission'

export const list = async (req, res) => {
  try {
    const {
      name,
      email,
      createdAt,
      permission,
      page = 1,
      limit = 10
    } = req.query

    const filter = {}
    if (name) filter.name = { $regex: name, $options: 'i' }
    if (email) filter.email = { $regex: email, $options: 'i' }
    if (createdAt) filter.createdAt = { $gte: new Date(createdAt) }

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
          select: 'name description'
        }
      })
      .skip(skip)
      .limit(pageSize)
      .exec()

    const totalManagers = await User.countDocuments({
      ...filter,
      'role.name': 'manager'
    })

    const filteredManagers = managers.filter((manager) => manager.role)

    res.status(StatusCodes.OK).json({
      total: filteredManagers.length,
      totalPages: Math.ceil(totalManagers / pageSize),
      currentPage: pageNumber,
      managers: filteredManagers
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching managers.',
      error: error.message
    })
  }
}

export const create = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body

    if (!name || !email || !password || !Array.isArray(permissions)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Name, email, password, and permissions are required.'
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: 'Email is already in use.' })
    }

    const managerRole = await Role.findOne({ name: 'manager' })
    if (!managerRole) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Manager role not found. Please seed roles first.' })
    }

    const validPermissions = await Permission.find({
      _id: { $in: permissions }
    })
    if (validPermissions.length !== permissions.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Some permissions are invalid.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const manager = new User({
      name,
      email,
      password: hashedPassword,
      role: managerRole._id
    })

    managerRole.permissions = permissions
    await managerRole.save()

    await manager.save()

    res.status(StatusCodes.CREATED).json({
      message: 'Manager created successfully.',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: managerRole.name,
        permissions: validPermissions.map((perm) => ({
          id: perm._id,
          name: perm.name,
          description: perm.description
        }))
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating manager.',
      error: error.message
    })
  }
}

export const changeManagerStatus = async (req, res) => {
  try {
    const { managerId, status } = req.body

    if (!managerId || !status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Manager ID and new status are required.'
      })
    }

    const validStatuses = ['active', 'inactive']
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      })
    }

    const manager = await User.findOne({
      _id: managerId,
      role: await Role.findOne({ name: 'manager' })._id
    })

    if (!manager) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Manager not found.'
      })
    }

    manager.status = status
    await manager.save()

    res.status(StatusCodes.OK).json({
      message: 'Manager status updated successfully.',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        status: manager.status
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating manager status.',
      error: error.message
    })
  }
}

export const deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params

    if (!managerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Manager ID is required.'
      })
    }

    const manager = await User.findOneAndDelete({
      _id: managerId,
      role: await Role.findOne({ name: 'manager' })._id
    })

    if (!manager) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Manager not found.'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'Manager deleted successfully.'
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting manager.',
      error: error.message
    })
  }
}
