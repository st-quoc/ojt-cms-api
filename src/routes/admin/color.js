import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateColor,
  adminDeleteColor,
  adminGetListColor,
} from '../../controllers/admin/colorController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListColor)
Router.route('/create').post(verifyAccessToken, adminCreateColor)
Router.route('/delete').delete(verifyAccessToken, adminDeleteColor)

export const colorAdminRoute = Router
