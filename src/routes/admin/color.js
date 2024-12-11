import express from 'express'
import {
  requirePermission,
  requireRole,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import {
  adminCreateColor,
  adminDeleteColor,
  adminGetListColor,
  adminUpdateColor,
  adminGetListColorWithoutPagination,
} from '../../controllers/admin/colorController.js'
const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requirePermission([
    'view_variant',
    'manager_variant',
    'manager_product',
    'view_product',
  ]),
  requireRole(['admin', 'manager']),
  adminGetListColor
)
Router.route('/list-no-paging').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission([
    'view_variant',
    'manager_variant',
    'manager_product',
    'view_product',
  ]),
  adminGetListColorWithoutPagination
)
Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminCreateColor
)
Router.route('/update/:id').put(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminUpdateColor
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminDeleteColor
)

export const colorAdminRoute = Router
