import express from 'express'
import {
  verifyAccessToken,
  requireRole
} from '../../middlewares/authMiddleware.js'
import {
  changeManagerStatus,
  create,
  deleteManager,
  list
} from '~/controllers/admin/managerController.js'

const Router = express.Router()

Router.route('/list').get(verifyAccessToken, requireRole(['admin']), list)
Router.route('/create').post(verifyAccessToken, requireRole(['admin']), create)
Router.route('/change_status/:managerId').put(
  verifyAccessToken,
  requireRole(['admin']),
  changeManagerStatus
)
Router.route('/delete/:managerId').delete(
  verifyAccessToken,
  requireRole(['admin']),
  deleteManager
)

export const managerRoute = Router
