import Blog from '../../models/Blog.js'

export const adminCreateBlog = async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, images } = req.body

    if (!title || !shortDescription || !fullDescription) {
      return res.status(400).json({
        success: false,
        message: 'Title, short description, and full description are required.',
      })
    }

    const newBlog = new Blog({
      title,
      shortDescription,
      fullDescription,
      images: images || [],
    })

    await newBlog.save()

    res.status(201).json({
      success: true,
      message: 'Blog created successfully.',
      blog: newBlog,
    })
  } catch (error) {
    console.error('Error creating blog:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error?.message || error,
    })
  }
}

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) // Sort by newest first
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

export const getBlogDetail = async (req, res) => {
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
    console.error('Error retrieving blog:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving blog.',
      error: error?.message || error,
    })
  }
}

// Edit a blog by ID
export const editBlog = async (req, res) => {
  const { id } = req.params
  const { title, description, images } = req.body

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required.',
    })
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, description, images },
      { new: true } // Return the updated document
    )

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully.',
      blog: updatedBlog,
    })
  } catch (error) {
    console.error('Error updating blog:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Error updating blog.',
      error: error?.message || error,
    })
  }
}

// Delete a blog by ID
export const deleteBlog = async (req, res) => {
  const { id } = req.params

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id)

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting blog:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Error deleting blog.',
      error: error?.message || error,
    })
  }
}
