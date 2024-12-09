import { VNPay } from 'vnpay'
import Order from '../../models/Order.js'
import dotenv from 'dotenv'
import Cart from '../../models/Cart.js'

dotenv.config()

const vnp_TmnCode = process.env.VNP_TMNCODE
const vnp_HashSecret = process.env.VNP_HASHSECRET
const vnp_Url = process.env.VNP_URL
const vnp_ReturnUrl = process.env.VNP_RETURNURL

const vnpay = new VNPay({
  tmnCode: vnp_TmnCode,
  secureSecret: vnp_HashSecret,
  vnpayHost: vnp_Url,
  hashAlgorithm: 'SHA512',
  testMode: true,
})

export const createPaymentUrl = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body

    if (!userId || !shippingAddress) {
      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp userId và địa chỉ giao hàng.' })
    }

    const userCart = await Cart.findOne({ userId })
    if (!userCart || userCart.items.length === 0) {
      return res
        .status(400)
        .json({ message: 'Giỏ hàng trống hoặc không tìm thấy giỏ hàng.' })
    }

    const totalPrice = userCart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
    console.log(totalPrice)
    const productDetails = userCart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }))

    const newOrder = new Order({
      user: userId,
      products: productDetails,
      totalPrice,
      paymentMethod: 'vnpay',
      paymentStatus: 'pending',
      shippingAddress,
    })

    const savedOrder = await newOrder.save()

    const ipAddr =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const orderIdStr = savedOrder._id.toString()

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderIdStr,
      vnp_OrderInfo: `Thanh toán cho đơn hàng ${savedOrder._id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_Locale: 'vn',
    })

    res.json({ paymentUrl })
  } catch (error) {
    console.error('Error creating payment URL:', error)
    res.status(500).send('Có lỗi xảy ra khi tạo URL thanh toán!')
  }
}

export const handleVnpayReturn = async (req, res) => {
  try {
    const query = req.query

    const isValid = vnpay.verifyReturnUrl(query)

    if (isValid) {
      if (query.vnp_ResponseCode === '00') {
        await Order.findByIdAndUpdate(query.vnp_TxnRef, {
          paymentStatus: 'paid',
          vnpayTransactionId: query.vnp_TransactionNo,
          vnpayResponseCode: query.vnp_ResponseCode,
        })

        const userId = query.userId
        if (userId) {
          const cart = await Cart.findOne({ userId })
          if (cart) {
            cart.items = []
            await cart.save()
          }
        }

        res.redirect('http://localhost:5173/cart?success')
      } else {
        await Order.findByIdAndUpdate(query.vnp_TxnRef, {
          paymentStatus: 'failed',
          vnpayResponseCode: query.vnp_ResponseCode,
        })

        res.redirect('http://localhost:5173/cart?payment-fail')
      }
    } else {
      res.status(400).send('Dữ liệu trả về không hợp lệ.')
    }
  } catch (error) {
    res
      .status(500)
      .send('Có lỗi xảy ra khi xử lý phản hồi từ VNPay: ' + error.message)
  }
}
