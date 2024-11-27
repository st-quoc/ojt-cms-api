import Product from '../../models/Product.js'
import { StatusCodes } from 'http-status-codes'
import Size from '../../models/Size.js'
import Color from '../../models/Color.js'
import Category from '../../models/Category.js'

export const adminGetListProduct = async (req, res) => {
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

export const adminGetProductDetail = async (req, res) => {
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

export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Product not found' })
    }

    res.status(StatusCodes.OK).json({ message: 'Product deleted successfully' })
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error', error: error.message })
  }
}

export const adminEditProduct = async (req, res) => {
  try {
    const { id } = req.params
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

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
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

    product.name = name
    product.sortDesc = sortDesc
    product.fullDesc = fullDesc
    product.categories = categoryDocs.map((category) => category._id)
    product.images = images
    product.variants = resolvedVariants

    await product.save()

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
