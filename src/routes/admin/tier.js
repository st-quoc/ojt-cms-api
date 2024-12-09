import express from 'express'
import {
  requirePermission,
  requireRole,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import {
  adminCreateTier,
  adminDeleteTier,
  adminGetListTier,
  adminGetTierById,
  adminUpdateTier,
} from '../../controllers/admin/tierController.js'
const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requirePermission(['view_tier', 'manager_tier']),
  requireRole(['admin', 'manager']),
  adminGetListTier
)
Router.route('/detail/:id').get(
  verifyAccessToken,
  requirePermission(['view_tier', 'manager_tier']),
  requireRole(['admin', 'manager']),
  adminGetTierById
)
Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_tier']),
  requireRole(['admin', 'manager']),
  adminCreateTier
)
Router.route('/update/:id').put(
  verifyAccessToken,
  requirePermission(['manager_tier']),
  requireRole(['admin', 'manager']),
  adminUpdateTier
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_tier']),
  requireRole(['admin', 'manager']),
  adminDeleteTier
)

export const tierAdminRoute = Router
