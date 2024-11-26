import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateSize,
  adminDeleteSize,
  adminGetListSize,
} from '../../controllers/admin/sizeController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListSize)
Router.route('/create').post(verifyAccessToken, adminCreateSize)
Router.route('/delete').delete(verifyAccessToken, adminDeleteSize)

export const sizeAdminRoute = Router
