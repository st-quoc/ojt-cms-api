import { VNPay } from 'vnpay'
import Order from '../../models/Order.js'
import Product from '../../models/Product.js'
import User from '../../models/User.js'
import dotenv from 'dotenv'

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
    const { userId, orderDetails, shippingAddress } = req.body

    if (!orderDetails || orderDetails.length === 0) {
      return res
        .status(400)
        .json({ message: 'Chi tiết đơn hàng không hợp lệ.' })
    }

    let totalPrice = 0
    const productDetails = []

    for (const item of orderDetails) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm hoặc số lượng không hợp lệ cho ID sản phẩm: ${item.productId}`,
        })
      }

      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(400).json({
          message: `Không tìm thấy sản phẩm với ID ${item.productId}.`,
        })
      }
      productDetails.push({ product: product._id, quantity: item.quantity })
      totalPrice += product.price * item.quantity
    }

    let user = null
    if (userId) {
      user = await User.findById(userId)
      if (!user) {
        return res.status(400).json({
          message: 'Không tìm thấy người dùng với ID này.',
        })
      }
    }

    const newOrder = new Order({
      user: user ? user._id : null,
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
      vnp_Amount: totalPrice * 100,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderIdStr,
      vnp_OrderInfo: `Thanh toán cho đơn hàng ${savedOrder._id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_Locale: 'vn',
    })

    res.json({ paymentUrl })
  } catch {
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

        res.send(
          `<h1>Thanh toán thành công</h1><p>Mã giao dịch: ${query.vnp_TransactionNo}</p>`
        )
      } else {
        await Order.findByIdAndUpdate(query.vnp_TxnRef, {
          paymentStatus: 'failed',
          vnpayResponseCode: query.vnp_ResponseCode,
        })
        res.send(
          `<h1>Thanh toán thất bại</h1><p>Mã lỗi: ${query.vnp_ResponseCode}</p>`
        )
      }
    } else {
      res.status(400).send('Dữ liệu trả về không hợp lệ.')
    }
  } catch {
    res.status(500).send('Có lỗi xảy ra khi xử lý phản hồi từ VNPay.')
  }
}
