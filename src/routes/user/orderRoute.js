import express from 'express'
import {
  createOrder,
  getMyOrders,
} from '../../controllers/user/orderController.js'

const Router = express.Router()

Router.post('/my-orders', getMyOrders)
Router.post('/createOrder', createOrder)

export const orderUserRoute = Router
