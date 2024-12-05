import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetListCategory,
  adminGetListCategoryWithoutPagination,
  adminUpdateCategory,
} from '../../controllers/admin/categoryController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListCategory)
Router.route('/list-no-paging').get(
  verifyAccessToken,
  adminGetListCategoryWithoutPagination
)
Router.route('/create').post(verifyAccessToken, adminCreateCategory)
Router.route('/update/:id').put(verifyAccessToken, adminUpdateCategory)
Router.route('/delete/:id').delete(verifyAccessToken, adminDeleteCategory)

export const categoryAdminRoute = Router
