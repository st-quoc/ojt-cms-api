import Cart from '../../models/Cart.js'
import Order from '../../models/Order.js'

export const getMyOrders = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const orders = await Order.find({ user: userId }).populate(
      'products.product'
    )
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error })
  }
}

export const createOrder = async (req, res) => {
  try {
    const { userId, shippingAddress, phoneNumber, shippingFee, paymentMethod } =
      req.body

    if (
      !userId ||
      !shippingAddress ||
      !phoneNumber ||
      !shippingFee ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields!' })
    }

    const userCart = await Cart.findOne({ userId })
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found!' })
    }

    const totalPrice =
      userCart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) + shippingFee

    const productDetails = userCart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }))

    let shippingMethod = ''
    if (shippingFee === 55000) {
      shippingMethod = 'Fast delivery'
    } else {
      shippingMethod = 'Standard delivery'
    }

    let paymentStatus = 'pending'
    if (paymentMethod === 'cod') {
      paymentStatus = 'pending'
    }

    const newOrder = new Order({
      user: userId,
      products: productDetails,
      totalPrice,
      phoneNumber,
      shippingMethod,
      paymentMethod,
      paymentStatus,
      shippingAddress,
    })

    const savedOrder = await newOrder.save()

    if (paymentMethod === 'vnpay') {
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

      return res.json({ paymentUrl })
    } else {
      res.status(201).json({
        message: 'Order created successfully!',
        order: savedOrder,
      })
    }
  } catch (error) {
    console.error('Error creating order:', error)
    res
      .status(500)
      .json({ message: 'An error occurred while creating the order!' })
  }
}
