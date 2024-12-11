import express from 'express'
import {
  getAllOrders,
  updateOrder,
} from '../../controllers/admin/orderController.js'

const router = express.Router()

router.get('/', getAllOrders)
router.put('/:orderId', updateOrder)

export const orderRoute = router
