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
  adminUpdateSize,
} from '../../controllers/admin/sizeController.js'
const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requirePermission(['view_variant']),
  requireRole(['admin', 'manager']),
  adminGetListSize
)
Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_variant']),
  requireRole(['admin', 'manager']),
  adminCreateSize
)
Router.route('/delete/:id').put(
  verifyAccessToken,
  requirePermission(['manager_variant']),
  requireRole(['admin', 'manager']),
  adminUpdateSize
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_variant']),
  requireRole(['admin', 'manager']),
  adminDeleteSize
)

export const sizeAdminRoute = Router
