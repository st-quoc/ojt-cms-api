import express from 'express'
import {
  addToCart,
  getCart,
  removeFromCart,
} from '../../controllers/user/cartController.js'

const Router = express.Router()

Router.route('/add').post(addToCart)
Router.route('/:userId').get(getCart)
Router.route('/remove').delete(removeFromCart)
export const cartRoutes = Router
