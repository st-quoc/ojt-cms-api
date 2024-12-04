import express from 'express'
import {
  verifyAccessToken,
  requireRole,
} from '../../middlewares/authMiddleware.js'

import {
  changeUserStatus,
  createUser,
  getUserDetail,
  listUsers,
  updateUser,
} from '../../controllers/admin/userController.js'

const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  listUsers
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  getUserDetail
)

Router.route('/create').post(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  createUser
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requireRole(['admin']),
  updateUser
)

Router.route('/change-status/:id').put(
  verifyAccessToken,
  requireRole(['admin']),
  changeUserStatus
)

export const userAdminRoute = Router
