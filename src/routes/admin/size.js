import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateSize,
  adminDeleteSize,
  adminGetListSize,
  adminUpdateSize,
} from '../../controllers/admin/sizeController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListSize)
Router.route('/create').post(verifyAccessToken, adminCreateSize)
Router.route('/delete/:id').put(verifyAccessToken, adminUpdateSize)
Router.route('/delete/:id').delete(verifyAccessToken, adminDeleteSize)

export const sizeAdminRoute = Router
