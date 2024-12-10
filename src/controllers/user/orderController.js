import Order from '../../models/Order.js'

export const getMyOrders = async (req, res) => {
  const { userId } = req.body // Lấy userId từ body

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
