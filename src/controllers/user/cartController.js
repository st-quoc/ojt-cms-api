import Cart from '../../models/Cart.js'

export const addToCart = async (req, res) => {
  const { userId, productId, name, price, quantity, size, color } = req.body

  try {
    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = new Cart({ userId, items: [] })
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, name, price, quantity, size, color })
    }

    await cart.save()
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const removeFromCart = async (req, res) => {
  const { userId, productId, size, color } = req.body

  try {
    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
    )

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    cart.items.splice(itemIndex, 1)

    await cart.save()

    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
    res.status(200).json(cart || { userId: req.params.userId, items: [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
