import express from 'express'
import {
  createPaymentUrl,
  handleVnpayReturn,
} from '../../controllers/payment/vnpayController.js'

const Router = express.Router()

Router.route('/create-payment-url').post(createPaymentUrl)

Router.route('/vnpay-return').get(handleVnpayReturn)

export const vnpayRoute = Router
