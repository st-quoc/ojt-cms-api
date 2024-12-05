import Blog from '../../models/Blog.js'

export const getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const totalCount = await Blog.countDocuments()

    res.status(200).json({
      success: true,
      data: blogs,
      totalCount,
    })
  } catch (error) {
    console.error('Error retrieving blogs:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving blogs.',
      error: error?.message || error,
    })
  }
}

export const getUserBlogDetail = async (req, res) => {
  const { id } = req.params

  try {
    const blog = await Blog.findById(id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.',
      })
    }

    res.status(200).json({
      success: true,
      blog,
    })
  } catch (error) {
    console.error('Error retrieving blog detail:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving blog detail.',
      error: error?.message || error,
    })
  }
}
