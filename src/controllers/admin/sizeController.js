import Size from '../../models/Size.js'

export const adminCreateSize = async (req, res) => {
  try {
    const { name } = req.body

    const existingSize = await Size.findOne({ name })
    if (existingSize) {
      return res.status(400).json({ message: 'Size already exists' })
    }

    const newSize = new Size({ name })
    await newSize.save()

    res.status(201).json(newSize)
  } catch {
    res.status(500).json({ message: 'Error creating size' })
  }
}

export const adminGetSizeById = async (req, res) => {
  try {
    const { id } = req.params

    const size = await Size.findById(id)

    if (!size) {
      return res.status(404).json({ message: 'Size not found' })
    }

    res.status(200).json(size)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching size by ID', error: error.message })
  }
}

export const adminGetListSize = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const sizes = await Size.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const totalSizes = await Size.countDocuments(query)

    res.status(200).json({
      sizes,
      total: totalSizes,
      page: Number(page),
      totalPages: Math.ceil(totalSizes / limit),
    })
  } catch {
    res.status(500).json({ message: 'Error fetching sizes' })
  }
}

export const adminGetListSizeWithoutPagination = async (req, res) => {
  try {
    const { search = '' } = req.query
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const sizes = await Size.find(query)

    res.status(200).json({
      total: sizes.length,
      sizes,
    })
  } catch {
    res.status(500).json({ message: 'Error fetching categories' })
  }
}

export const adminDeleteSize = async (req, res) => {
  try {
    const { id } = req.params
    const deletedSize = await Size.findByIdAndDelete(id)

    if (!deletedSize) {
      return res.status(404).json({ message: 'Size not found' })
    }

    res.status(200).json({ message: 'Size deleted successfully' })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminUpdateSize = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const updatedSize = await Size.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    )

    if (!updatedSize) {
      return res.status(404).json({ message: 'Size not found' })
    }

    res
      .status(200)
      .json({ message: 'Size updated successfully', data: updatedSize })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}
