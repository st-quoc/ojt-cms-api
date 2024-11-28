import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { authRoute } from './admin/auth.js'
import { productAdminRoute } from './admin/product.js'
import { publicRoute } from './user/public.js'
import { vnpayRoute } from './vnpay/payment.js'
import { sizeAdminRoute } from './admin/size.js'
import { colorAdminRoute } from './admin/color.js'
import { categoryAdminRoute } from './admin/category.js'
import { productUserRoute } from './user/product.js'
import { authUserRoute } from './user/auth.js'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

Router.use('/auth', authRoute)
Router.use('/admin/product', productAdminRoute)
Router.use('/admin/size', sizeAdminRoute)
Router.use('/admin/color', colorAdminRoute)
Router.use('/admin/category', categoryAdminRoute)

Router.use('/public', publicRoute)
Router.use('/vnpay', vnpayRoute)

Router.use('/user/product', productUserRoute)

Router.use('/user/auth', authUserRoute)

export const APIs_V1 = Router
