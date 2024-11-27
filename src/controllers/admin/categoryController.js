import Category from '../../models/Category.js'

export const adminCreateCategory = async (req, res) => {
  try {
    const { name, thumbnail, description } = req.body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res
        .status(400)
        .json({ message: 'Name is required and must be a valid string.' })
    }

    const existingCategory = await Category.findOne({ name: name.trim() })
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists.' })
    }

    const newCategory = new Category({
      name: name.trim(),
      thumbnail: thumbnail || '',
      description: description || '',
    })

    await newCategory.save()

    res.status(201).json(newCategory)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error. Please try again later.' })
  }
}

export const adminGetListCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const skip = (page - 1) * limit

    const total = await Category.countDocuments(query)
    const categories = await Category.find(query)
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      categories,
    })
  } catch {
    res.status(500).json({ message: 'Error fetching categories' })
  }
}

export const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const deletedCategory = await Category.findByIdAndDelete(id)

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.status(200).json({ message: 'Category deleted successfully' })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, thumbnail } = req.body

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        thumbnail: thumbnail.trim(),
      },
      { new: true }
    )

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res
      .status(200)
      .json({ message: 'Category updated successfully', data: updatedCategory })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}
