import express from 'express'
import {
  register,
  login,
  refreshToken,
  getPermissionsList,
  getProfile,
  changeAvatar,
  resetPassword,
  forgotPassword,
} from '../../controllers/admin/authController.js'
import {
  verifyAccessToken,
  requireRole,
} from '../../middlewares/authMiddleware.js'
import multer from 'multer'

const Router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

Router.route('/register').post(register)
Router.route('/login').post(login)
Router.route('/forgot-password').post(forgotPassword)
Router.route('/reset-password').post(resetPassword)
Router.route('/refresh-token').put(refreshToken)
Router.route('/profile').get(verifyAccessToken, getProfile)
Router.route('/avatar').post(
  verifyAccessToken,
  upload.single('avatar'),
  changeAvatar
)

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
