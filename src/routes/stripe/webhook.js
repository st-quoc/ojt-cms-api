import express from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import Order from '../../models/Order.js' // Model Order của bạn

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Xử lý webhook từ Stripe
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event

    try {
      // Xác thực webhook bằng Stripe Webhook Secret
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook error:', err)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(`Webhook error: ${err.message}`)
    }

    // Xử lý các sự kiện thanh toán
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        // Kiểm tra đơn hàng trong database
        const order = await Order.findById(orderId).populate('products.product')
        if (!order) {
          console.error(`Order not found for id: ${orderId}`)
          return res.status(StatusCodes.NOT_FOUND).send('Order not found')
        }

        // Cập nhật trạng thái đơn hàng sau khi thanh toán thành công
        order.paymentStatus = 'paid'
        order.orderStatus = 'processing' // Bạn có thể thay đổi theo trạng thái của đơn hàng
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
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(StatusCodes.OK).json({ received: true })
  }
)

export default router
