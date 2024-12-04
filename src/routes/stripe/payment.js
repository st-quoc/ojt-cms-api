import express from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import Order from '../../models/Order.js'
import mongoose from 'mongoose'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body

    if (!process.env.BASE_URL || !process.env.BASE_URL.startsWith('http')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Invalid BASE_URL in environment variables' })
    }

    const successUrl = `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.BASE_URL}/cancel`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
      },
    })

    res.status(StatusCodes.OK).json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
  }
})

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
      case 'checkout.session.completed':
        const session = event.data.object
        const orderId = session.metadata.orderId

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid orderId' })
        }

        const order = await Order.findById(orderId).populate('products.product')
        if (!order) {
          return res.status(StatusCodes.NOT_FOUND).send('Order not found')
        }

        order.paymentStatus = 'paid'
        order.orderStatus = 'processing'
        await order.save()

        break

      default:
    }

    res.status(StatusCodes.OK).json({ received: true })
  }
)

export default router
