import Product from '../../models/Product.js'
import { StatusCodes } from 'http-status-codes'
export const getListProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (page - 1) * limit

    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const products = await Product.find(query)
      .populate({
        path: 'categories',
        select: 'name',
      })
      .populate({
        path: 'variants.size',
        select: 'name',
      })
      .populate({
        path: 'variants.color',
        select: 'name',
      })
      .skip(skip)
      .limit(Number(limit))

    const totalProducts = await Product.countDocuments(query)

    const productList = products.map((product) => {
      const categories = product.categories
        ?.filter((category) => category?.name)
        .map((category) => category.name)

      const variants = product.variants
        ?.filter((variant) => variant?.size?.name && variant?.color?.name)
        .map((variant) => ({
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: variant.price,
        }))

      return {
        id: product._id,
        name: product.name,
        images: product.images,
        sortDesc: product.sortDesc,
        description: product.fullDesc,
        categories,
        variants,
      }
    })

    res.status(200).json({
      products: productList,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      perPage: Number(limit),
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const getDetailProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)
      .populate('categories')
      .populate('variants.size')
      .populate('variants.color')

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Product not found' })
    }

    const variants = product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      price: variant.price,
    }))

    const productDetail = {
      id: product._id,
      name: product.name,
      images: product.images,
      sortDesc: product.sortDesc,
      fullDesc: product.fullDesc,
      categories: product.categories,
      variants,
    }

    res.status(StatusCodes.OK).json({ product: productDetail })
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error', error: error.message })
  }
}
