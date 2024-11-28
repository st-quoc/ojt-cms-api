import Color from '../../models/Color.js'

export const adminCreateColor = async (req, res) => {
  try {
    const { name } = req.body

    const existingColor = await Color.findOne({ name })
    if (existingColor) {
      return res.status(400).json({ message: 'Color already exists' })
    }

    const newColor = new Color({ name })
    await newColor.save()

    res.status(201).json(newColor)
  } catch {
    res.status(500).json({ message: 'Error creating Color' })
  }
}

export const adminGetColorById = async (req, res) => {
  try {
    const { id } = req.params

    const color = await Color.findById(id)

    if (!color) {
      return res.status(404).json({ message: 'Color not found' })
    }

    res.status(200).json(color)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching color by ID', error: error.message })
  }
}

export const adminGetListColor = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const skip = (page - 1) * limit

    const colors = await Color.find(query).skip(skip).limit(Number(limit))
    const total = await Color.countDocuments(query)

    res.status(200).json({
      colors,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    res.status(500).json({ message: 'Error fetching colors' })
  }
}

export const adminDeleteColor = async (req, res) => {
  try {
    const { id } = req.params
    const deletedColor = await Color.findByIdAndDelete(id)

    if (!deletedColor) {
      return res.status(404).json({ message: 'Color not found' })
    }

    res.status(200).json({ message: 'Color deleted successfully' })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminUpdateColor = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const updatedColor = await Color.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    )

    if (!updatedColor) {
      return res.status(404).json({ message: 'Color not found' })
    }

    res
      .status(200)
      .json({ message: 'Color updated successfully', data: updatedColor })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
}
