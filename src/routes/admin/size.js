import express from 'express'
import {
  requirePermission,
  requireRole,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import {
  adminCreateSize,
  adminDeleteSize,
  adminGetListSize,
  adminGetListSizeWithoutPagination,
  adminUpdateSize,
} from '../../controllers/admin/sizeController.js'
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
  adminGetListSize
)
Router.route('/list-no-paging').get(
  verifyAccessToken,
  requirePermission([
    'view_variant',
    'manager_variant',
    'manager_product',
    'view_product',
  ]),
  requireRole(['admin', 'manager']),
  adminGetListSizeWithoutPagination
)
Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminCreateSize
)
Router.route('/delete/:id').put(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminUpdateSize
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_variant', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminDeleteSize
)

export const sizeAdminRoute = Router
