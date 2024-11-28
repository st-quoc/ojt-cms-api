import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateSize,
  adminDeleteSize,
  adminGetListSize,
  adminUpdateSize,
  adminGetSizeById,
} from '../../controllers/admin/sizeController.js'
const Router = express.Router()

Router.route('/list').get(adminGetListSize)
Router.route('/:id').get(adminGetSizeById)
export const sizeUserRoute = Router
