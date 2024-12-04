import Blog from '../../models/Blog.js'

export const createBlog = async (req, res) => {
  try {
    const { thumbnail, title, sortDesc, fullDesc, status } = req.body

    if (!thumbnail || !title || !sortDesc || !fullDesc) {
      return res.status(400).json({
        message:
          'Missing required fields: thumbnail, title, sortDesc, or fullDesc',
      })
    }

    const newBlog = new Blog({
      thumbnail,
      title,
      sortDesc,
      fullDesc,
      status: status || 'draft',
    })

    const savedBlog = await newBlog.save()

    res.status(201).json({
      message: 'Blog created successfully',
      blog: savedBlog,
    })
  } catch {
    res.status(500).json({
      message: 'Error creating blog',
    })
  }
}

export const getAllBlogs = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit

    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { sortDesc: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))

    const total = await Blog.countDocuments(searchQuery)

    res.status(200).json({
      success: true,
      blogs: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
    })
  }
}

export const getDetailBlog = async (req, res) => {
  try {
    const { id } = req.params

    const blog = await Blog.findById(id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      })
    }

    res.status(200).json({
      success: true,
      blog: blog,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog details',
    })
  }
}

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      })
    }

    res.status(200).json({
      message: 'Blog updated successfully',
      blog: blog,
    })
  } catch {
    res.status(500).json({
      message: 'Error updating blog',
    })
  }
}

export const deleteBlog = async (req, res) => {
  const { id } = req.params

  try {
    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    res.status(200).json({ message: 'Blog deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error })
  }
}

export const changeBlogStatus = async (req, res) => {
  const blogId = req.params.id

  try {
    const blog = await Blog.findById(blogId)

    if (!blog) {
      return res.status(404).json({ message: 'Blog does not exist.' })
    }

    blog.status = blog.status === 'draft' ? 'public' : 'draft'

    await blog.save()

    res.status(200).json({
      message: 'Blog status updated successfully!',
      status: blog.status,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error!', error: err.message })
  }
}
