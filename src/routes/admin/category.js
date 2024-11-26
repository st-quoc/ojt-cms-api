import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetListCategory,
} from '../../controllers/admin/categoryController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListCategory)
Router.route('/create').post(verifyAccessToken, adminCreateCategory)
Router.route('/delete').delete(verifyAccessToken, adminDeleteCategory)

export const categoryAdminRoute = Router
