import Cart from '../../models/Cart.js'
import Product from '../../models/Product.js'

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, name, price, quantity, sizeId, colorId } =
      req.body
    if (
      !userId ||
      !productId ||
      !name ||
      !price ||
      !quantity ||
      !sizeId ||
      !colorId
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    let cart = await Cart.findOne({ userId })

    if (!cart) {
      cart = new Cart({ userId, items: [] })
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId &&
        item.sizeId === sizeId &&
        item.colorId === colorId
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, name, price, quantity, sizeId, colorId })
    }

    await cart.save()

    res.status(200).json({ message: 'Item added to cart successfully', cart })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const removeItemFromCart = async (req, res) => {
  try {
    const { userId, productId, sizeId, colorId } = req.body

    if (!userId || !productId || !sizeId || !colorId) {
      return res.status(400).json({ message: 'All parameters are required' })
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.sizeId.toString() === sizeId.toString() &&
        item.colorId.toString() === colorId.toString()
    )

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    cart.items.splice(itemIndex, 1)
    await cart.save()

    res.status(200).json({
      message: 'Item removed from cart',
      cart,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const detailedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId)
          .populate('variants.size')
          .populate('variants.color')

        if (!product) {
          return null
        }

        const variant = product.variants.find(
          (v) =>
            v.size._id.toString() === item.sizeId &&
            v.color._id.toString() === item.colorId
        )

        if (!variant) {
          return null
        }

        return {
          productId: item.productId,
          name: product.name,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          quantity: item.quantity,
          images: product.images,
        }
      })
    )

    res.status(200).json({
      userId: cart.userId,
      items: detailedItems.filter(Boolean),
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const updateQuantity = async (req, res) => {
  try {
    const { userId, productId, colorId, sizeId, quantity } = req.body

    if (!userId || !productId || !colorId || !sizeId || !quantity) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId.toString() === colorId &&
        item.sizeId.toString() === sizeId
    )

    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity
    } else {
      const newItem = {
        productId,
        colorId,
        sizeId,
        quantity,
      }
      cart.items.push(newItem)
    }

    await cart.save()

    res
      .status(200)
      .json({ message: 'Cart updated successfully', items: cart.items })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update cart', error: error.message })
  }
}
export const deleteAllProductInCart = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({ message: 'All products removed from cart', cart })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to clear cart', error: error.message })
  }
}
