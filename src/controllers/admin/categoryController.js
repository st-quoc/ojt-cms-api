import Category from '../../models/Category.js'

export const adminCreateCategory = async (req, res) => {
  try {
    const { name } = req.body

    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const newCategory = new Category({ name })
    await newCategory.save()

    res.status(201).json(newCategory)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error creating size' })
  }
}

export const adminGetListCategory = async (req, res) => {
  try {
    const sizes = await Category.find()

    res.status(200).json(sizes)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error fetching sizes' })
  }
}

export const adminDeleteCategory = (req, res) => {
  // eslint-disable-next-line no-console
  console.log('🚀  res  🚀', res)
  // eslint-disable-next-line no-console
  console.log('🚀  req  🚀', req)
}
