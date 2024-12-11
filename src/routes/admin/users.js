import express from 'express'
import {
  verifyAccessToken,
  requireRole,
  requirePermission,
} from '../../middlewares/authMiddleware.js'

import {
  changeUserStatus,
  createUser,
  deleteUser,
  getUserDetail,
  listUsers,
  updateUser,
} from '../../controllers/admin/userController.js'

const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requirePermission(['view_user', 'manager_user']),
  requireRole(['admin', 'manager']),
  listUsers
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requirePermission(['view_user', 'manager_user']),
  requireRole(['admin', 'manager']),
  getUserDetail
)

Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_user']),
  requireRole(['admin', 'manager']),
  createUser
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requirePermission(['manager_user']),
  requireRole(['admin']),
  updateUser
)

Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_user']),
  requireRole(['admin']),
  deleteUser
)

Router.route('/change-status/:id').put(
  verifyAccessToken,
  requirePermission(['manager_user']),
  requireRole(['admin']),
  changeUserStatus
)

export const userAdminRoute = Router
