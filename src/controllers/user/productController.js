import Product from '../../models/Product.js'

export const getListProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      color,
      size,
      stockCondition,
      stockValue,
      page = 1,
      limit = 10,
    } = req.query

    const filter = {}

    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    }

    if (category) {
      filter.categories = { $in: [category] }
    }

    if (minPrice || maxPrice) {
      filter['variants.price'] = {}
      if (minPrice) filter['variants.price'].$gte = parseFloat(minPrice)
      if (maxPrice) filter['variants.price'].$lte = parseFloat(maxPrice)
    }

    if (color) {
      filter['variants.color'] = { $in: [color] }
    }

    if (size) {
      filter['variants.size'] = { $in: [size] }
    }

    if (stockCondition && stockValue) {
      const stockQuery = {}
      if (stockCondition === '>') {
        stockQuery.$gt = parseInt(stockValue)
      } else if (stockCondition === '<') {
        stockQuery.$lt = parseInt(stockValue)
      } else {
        stockQuery.$eq = parseInt(stockValue)
      }
      filter['variants.stock'] = stockQuery
    }

    const skip = (page - 1) * limit

    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('categories', 'name')
      .populate('variants.color', 'name')
      .populate('variants.size', 'name')

    const totalProducts = await Product.countDocuments(filter)

    res.status(200).json({
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        sortDesc: product.sortDesc,
        fullDesc: product.fullDesc,
        categories: product.categories.map((cat) => cat.name),
        images: product.images,
        variants: product.variants.map((variant) => ({
          size: variant.size.name,
          color: variant.color.name,
          price: variant.price,
          stock: variant.stock,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products.',
      error: error.message,
    })
  }
}

export const getDetailProduct = async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('🚀  res  🚀', res)
  // eslint-disable-next-line no-console
  console.log('🚀  req  🚀', req)
}
