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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error creating Color' })
  }
}

export const adminGetListColor = async (req, res) => {
  try {
    const colors = await Color.find()

    res.status(200).json(colors)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🚀  error  🚀', error)
    res.status(500).json({ message: 'Error fetching Colors' })
  }
}

export const adminDeleteColor = (req, res) => {
  // eslint-disable-next-line no-console
  console.log('🚀  res  🚀', res)
  // eslint-disable-next-line no-console
  console.log('🚀  req  🚀', req)
}
