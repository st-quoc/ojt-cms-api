import Product from '../../models/Product.js'
import { StatusCodes } from 'http-status-codes'

export const getListProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query

    const filter = {}

    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    }
    if (category) {
      filter.category = category
    }
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    const skip = (page - 1) * limit
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })

    const totalProducts = await Product.countDocuments(filter)

    res.status(StatusCodes.OK).json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching products.',
      error: error.message,
    })
  }
}
