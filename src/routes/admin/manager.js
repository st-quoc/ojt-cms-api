import express from 'express'
import {
  verifyAccessToken,
  requireRole,
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
  requireRole(['admin']),
  listManager
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requireRole(['admin']),
  updateManager
)

Router.route('/create').post(
  verifyAccessToken,
  requireRole(['admin']),
  createManager
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requireRole(['admin']),
  updateManager
)

Router.route('/change-status/:id').put(
  verifyAccessToken,
  requireRole(['admin']),
  changeManagerStatus
)

export const managerRoute = Router
