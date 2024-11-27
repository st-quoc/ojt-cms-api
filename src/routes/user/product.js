import express from 'express'
import {
  getDetailProduct,
  getListProducts,
} from '../../controllers/user/productController.js'

const Router = express.Router()

Router.route('/list').get(getListProducts)

Router.route('/detail/:id').get(getDetailProduct)

export const productUserRoute = Router
