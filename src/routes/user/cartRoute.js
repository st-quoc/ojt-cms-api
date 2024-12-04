import express from 'express'
import {
  addToCart,
  getCartItems,
  removeItemFromCart,
  updateQuantity,
} from '../../controllers/user/cartController.js'

const Router = express.Router()

Router.route('/list/:userId').get(getCartItems)
Router.route('/add').post(addToCart)
Router.route('/update').put(updateQuantity)
Router.route('/remove').delete(removeItemFromCart)
export const cartRoutes = Router
