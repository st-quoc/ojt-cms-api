import express from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import Order from '../../models/Order.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(`Webhook error: ${err.message}`)
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        const order = await Order.findById(orderId).populate('products.product')
        if (!order) {
          return res.status(StatusCodes.NOT_FOUND).send('Order not found')
        }

        order.paymentStatus = 'paid'
        order.orderStatus = 'processing'
        await order.save()
        break

      case 'payment_intent.failed':
        const failedPaymentIntent = event.data.object
        const failedOrderId = failedPaymentIntent.metadata.orderId
        const failedOrder = await Order.findById(failedOrderId)
        if (!failedOrder) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .send('Failed order not found')
        }
        failedOrder.paymentStatus = 'failed'
        await failedOrder.save()
        break

      default:
    }

    res.status(StatusCodes.OK).json({ received: true })
  }
)

export default router
