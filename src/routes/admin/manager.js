import express from 'express'
import {
  verifyAccessToken,
  requireRole,
  requirePermission,
} from '../../middlewares/authMiddleware.js'
import {
  changeManagerStatus,
  createManager,
  deleteManager,
  getManagerDetail,
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
  getManagerDetail
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

Router.route('/delete/:id').delete(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_manager']),
  deleteManager
)

Router.route('/change-status/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_manager']),
  changeManagerStatus
)

export const managerRoute = Router
