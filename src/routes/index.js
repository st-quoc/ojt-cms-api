import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { authRoute } from './admin/auth'
import { productRoute } from './admin/product'
import { managerRoute } from './admin/manager'
import { publicRoute } from './user/public'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

Router.use('/auth', authRoute)
Router.use('/product', productRoute)
Router.use('/manager', managerRoute)

Router.use('/public', publicRoute)

export const APIs_V1 = Router
