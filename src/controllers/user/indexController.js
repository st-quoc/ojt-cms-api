import Category from '../../models/Category.js'
import Color from '../../models/Color.js'
import Size from '../../models/Size.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()

    if (!categories.length) {
      return res.status(404).json({ message: 'No categories found' })
    }

    res.status(200).json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export const getSizes = async (req, res) => {
  try {
    const sizes = await Size.find()

    if (!sizes.length) {
      return res.status(404).json({ message: 'No sizes found' })
    }

    res.status(200).json(sizes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export const getColors = async (req, res) => {
  try {
    const colors = await Color.find()

    if (!colors.length) {
      return res.status(404).json({ message: 'No colors found' })
    }

    res.status(200).json(colors)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}
