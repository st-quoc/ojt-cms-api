import express from 'express'
import {
  getAllOrders,
  updateOrder,
} from '../../controllers/admin/orderController.js'

import {
  verifyAccessToken,
  requireRole,
  requirePermission,
} from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.get(
  '/list',
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_order', 'manager_order']),
  getAllOrders
)

router.put(
  '/:orderId',
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_order', 'manager_order']),
  updateOrder
)

export const orderRoute = router
