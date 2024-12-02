import express from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import Order from '../../models/Order.js' // Model Order của bạn
import mongoose from 'mongoose'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Route để tạo Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body

    // Kiểm tra nếu BASE_URL hợp lệ
    if (!process.env.BASE_URL || !process.env.BASE_URL.startsWith('http')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Invalid BASE_URL in environment variables' })
    }

    // URL success và cancel
    const successUrl = `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.BASE_URL}/cancel`

    // Tạo Checkout Session trong Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd', // Hoặc 'vnd' nếu bạn muốn thanh toán bằng VND
          product_data: {
            name: item.name,
            images: [item.image], // Hình ảnh của sản phẩm
          },
          unit_amount: item.price * 100, // Giá sản phẩm tính bằng cent (cent = 1/100 của đơn vị tiền tệ)
        },
        quantity: item.quantity,
      })),
      mode: 'payment', // Chế độ thanh toán 1 lần
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress), // Thông tin địa chỉ giao hàng
      },
    })

    res.status(StatusCodes.OK).json({
      sessionId: session.id,
      url: session.url, // Đưa đường link thanh toán ra cho người dùng
    })
  } catch (error) {
    console.error('Error creating checkout session: ', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
  }
})

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
      case 'checkout.session.completed':
        const session = event.data.object
        const orderId = session.metadata.orderId

        // Kiểm tra nếu orderId hợp lệ
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
          console.error(`Invalid or missing orderId: ${orderId}`)
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid orderId' })
        }

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

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(StatusCodes.OK).json({ received: true })
  }
)

export default router
