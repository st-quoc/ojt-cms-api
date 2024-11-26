import Product from '../../models/Product.js'
import { StatusCodes } from 'http-status-codes'
import Size from '../../models/Size.js'
import Color from '../../models/Color.js'

export const adminGetProductList = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('categories')
      .populate('variants.size')
      .populate('variants.color')

    const productList = products.map((product) => {
      const categories = product.categories.map((category) => category.name)

      const variants = product.variants.map((variant) => ({
        size: variant.size.name,
        color: variant.color.name,
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

    res.status(StatusCodes.OK).json({ products: productList })
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error', error: error.message })
  }
}

export const adminCreateProduct = async (req, res) => {
  try {
    const {
      name,
      sortDesc,
      fullDesc,
      categories = [],
      images,
      variants,
    } = req.body

    if (!name || !sortDesc || !fullDesc || !images || !variants) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    let categoryDocs = []
    if (categories.length > 0) {
      categoryDocs = await Category.find({ _id: { $in: categories } })
      if (categoryDocs.length !== categories.length) {
        return res.status(400).json({ message: 'Some categories are invalid' })
      }
    }

    const variantPromises = variants.map(async (variant) => {
      const size = await Size.findById(variant.size)
      const color = await Color.findById(variant.color)

      if (!size || !color) {
        throw new Error('Invalid size or color')
      }

      return {
        size: size._id,
        color: color._id,
        price: variant.price,
        stock: variant.stock,
      }
    })

    const resolvedVariants = await Promise.all(variantPromises)

    const newProduct = new Product({
      name,
      sortDesc,
      fullDesc,
      categories: categoryDocs.map((category) => category._id),
      images,
      variants: resolvedVariants,
    })

    await newProduct.save()

    res
      .status(201)
      .json({ message: 'Product created successfully', product: newProduct })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
