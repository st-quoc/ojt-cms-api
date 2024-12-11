import Order from '../../models/Order.js'

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price')
    res.status(200).json(orders)
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
    order.orderStatus = orderStatus
    await order.save()
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
