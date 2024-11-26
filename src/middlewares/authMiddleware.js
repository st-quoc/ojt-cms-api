import User from '../models/User.js'
import dotenv from 'dotenv'
import { StatusCodes } from 'http-status-codes'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider,
} from '../providers/JwtProvider.js'

dotenv.config()

export const verifyAccessToken = async (req, res, next) => {
  const accessToken = req.headers?.authorization
  if (!accessToken) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authorized! (Token not found)' })
    return
  }

  try {
    const accessTokenDecoded = await JWTProvider.verifyToken(
      accessToken.substring('Bearer '.length),
      ACCESS_TOKEN_SECRET_SIGNATURE
    )
    req.userInfo = accessTokenDecoded

    const user = await User.findById(req.userInfo.id).populate({
      path: 'role',
      populate: { path: 'permissions' },
    })

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found!' })
    }
    next()
  } catch (error) {
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need to refresh token.' })
      return
    }
    res.status(StatusCodes.GONE).json({ message: 'Authorized! Please login.' })
  }
}

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.userInfo.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    next()
  }
}

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user?.role?.name?.includes(role)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    next()
  }
}
