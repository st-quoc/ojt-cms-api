import Order from '../../models/Order.js'

export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      startDate,
      endDate,
    } = req.query

    const skip = (page - 1) * limit

    const query = {}

    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) {
      query.orderStatus = status
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const totalOrders = await Order.countDocuments(query)

    res.status(200).json({
      orders,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateOrder = async (req, res) => {
  const { orderId } = req.params
  const { orderStatus } = req.body
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (orderStatus === 'shipped') {
      order.paymentStatus = 'paid'
    }

    order.orderStatus = orderStatus
    await order.save()
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
