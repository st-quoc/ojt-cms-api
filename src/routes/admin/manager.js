import express from 'express'
import {
  verifyAccessToken,
  requireRole,
  requirePermission,
} from '../../middlewares/authMiddleware.js'
import {
  changeManagerStatus,
  createManager,
  listManager,
  updateManager,
} from '../../controllers/admin/managerController.js'

const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_manager', 'manager_manager']),
  listManager
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_manager', 'manager_manager']),
  updateManager
)

Router.route('/create').post(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_manager']),
  createManager
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_manager']),
  updateManager
)

Router.route('/change-status/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_manager']),
  changeManagerStatus
)

export const managerRoute = Router
