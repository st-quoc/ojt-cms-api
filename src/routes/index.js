import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { authRoute } from './auth'
import { productRoute } from './product'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

/** User APIs */
Router.use('/auth', authRoute)

/** Dashboard APIs */
Router.use('/product', productRoute)

export const APIs_V1 = Router
