import Tier from '../../models/Tier.js'

export const adminCreateTier = async (req, res) => {
  try {
    const { image, name, minSpent, maxSpent, description } = req.body
    const newTier = new Tier({ image, name, minSpent, maxSpent, description })
    await newTier.save()
    res
      .status(201)
      .json({ message: 'Tier created successfully', tier: newTier })
  } catch (error) {
    res.status(500).json({ message: 'Error creating tier', error })
  }
}

export const adminGetTierById = async (req, res) => {
  try {
    const { id } = req.params
    const tier = await Tier.findById(id)
    if (!tier) return res.status(404).json({ message: 'Tier not found' })
    res.status(200).json(tier)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tier detail', error })
  }
}

export const adminGetListTier = async (req, res) => {
  try {
    const { search, minSpent, maxSpent, page = 1, limit = 10 } = req.query
    const query = {}

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    if (minSpent || maxSpent) {
      query.minSpent = minSpent ? { $gte: +minSpent } : undefined
      query.maxSpent = maxSpent ? { $lte: +maxSpent } : undefined
    }

    const skip = (page - 1) * limit
    const totalTiers = await Tier.countDocuments(query)
    const tiers = await Tier.find(query).skip(skip).limit(+limit)

    res.status(200).json({
      tiers: tiers,
      pagination: {
        total: totalTiers,
        page: +page,
        limit: +limit,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tiers', error })
  }
}

export const adminDeleteTier = async (req, res) => {
  try {
    const { id } = req.params
    const deletedTier = await Tier.findByIdAndDelete(id)
    if (!deletedTier) return res.status(404).json({ message: 'Tier not found' })
    res.status(200).json({ message: 'Tier deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tier', error })
  }
}

export const adminUpdateTier = async (req, res) => {
  try {
    const { id } = req.params
    const { image, name, minSpent, maxSpent, description } = req.body
    const updatedTier = await Tier.findByIdAndUpdate(
      id,
      { image, name, minSpent, maxSpent, description },
      { new: true }
    )
    if (!updatedTier) return res.status(404).json({ message: 'Tier not found' })
    res
      .status(200)
      .json({ message: 'Tier updated successfully', tier: updatedTier })
  } catch (error) {
    res.status(500).json({ message: 'Error updating tier', error })
  }
}
