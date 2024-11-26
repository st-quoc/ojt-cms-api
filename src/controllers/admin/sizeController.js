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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error creating size' })
  }
}

export const adminGetListSize = async (req, res) => {
  try {
    const sizes = await Size.find()

    res.status(200).json(sizes)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error fetching sizes' })
  }
}

export const adminDeleteSize = (req, res) => {
  // eslint-disable-next-line no-console
  console.log('🚀  res  🚀', res)
  // eslint-disable-next-line no-console
  console.log('🚀  req  🚀', req)
}
