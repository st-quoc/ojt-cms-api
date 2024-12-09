import express from 'express'
import {
  requirePermission,
  requireRole,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetListCategory,
  adminGetListCategoryWithoutPagination,
  adminUpdateCategory,
} from '../../controllers/admin/categoryController.js'
const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_variant', 'manager_variant']),
  adminGetListCategory
)
Router.route('/list-no-paging').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_variant', 'manager_variant']),
  adminGetListCategoryWithoutPagination
)
Router.route('/create').post(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_variant']),
  adminCreateCategory
)
Router.route('/update/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_variant']),
  adminUpdateCategory
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_variant']),
  adminDeleteCategory
)

export const categoryAdminRoute = Router
