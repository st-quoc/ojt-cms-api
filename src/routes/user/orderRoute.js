import express from 'express'
import { getMyOrders } from '../../controllers/user/orderController.js'

const Router = express.Router()

Router.post('/my-orders', getMyOrders)

export const orderUserRoute = Router
