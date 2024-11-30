import express from 'express'
import {
  register,
  login,
  refreshToken,
  getPermissionsList,
} from '../../controllers/admin/authController.js'
import {
  verifyAccessToken,
  requireRole,
} from '../../middlewares/authMiddleware.js'

const Router = express.Router()

Router.route('/register').post(register)
Router.route('/login').post(login)
Router.route('/refresh-token').put(refreshToken)

Router.route('/permissions/list').get(
  verifyAccessToken,
  requireRole(['admin']),
  getPermissionsList
)

Router.route('/admin').get(
  verifyAccessToken,
  requireRole('admin'),
  (req, res) => {
    res.json({ message: 'Welcome Admin' })
  }
)

export const authRoute = Router
