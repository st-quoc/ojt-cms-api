import Blog from '../../models/Blog.js'

export const list = async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query

  try {
    const filter = {
      status: 'public',
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sortDesc: { $regex: search, $options: 'i' } },
        { fullDesc: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const blogs = await Blog.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })

    const total = await Blog.countDocuments(filter)

    res.json({
      items: blogs,
      total,
      page,
      limit,
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const detail = async (req, res) => {
  const { id } = req.params

  try {
    const blog = await Blog.findOne({ _id: id, status: 'public' })

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or not public' })
    }

    res.json(blog)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
