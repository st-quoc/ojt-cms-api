import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateColor,
  adminDeleteColor,
  adminGetListColor,
  adminUpdateColor,
  adminGetColorById,
} from '../../controllers/admin/colorController.js'
const Router = express.Router()

Router.route('/list').get(adminGetListColor)
Router.route('/:id').get(adminGetColorById)

export const colorUserRoute = Router
