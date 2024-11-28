import Blog from '../../models/Blog.js'

export const adminCreateBlog = async (req, res) => {
  try {
    const { title, description, status, images } = req.body

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required.',
      })
    }

    const newBlog = new Blog({
      title,
      description,
      images: images || [], // Lưu hình ảnh nếu có
      status: status || 'Draft',
      createdAt: new Date(),
    })

    await newBlog.save()

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully.',
      blog: newBlog,
    })
  } catch (error) {
    console.error('Error creating blog:', error)

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error.',
        error: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
      error: error.message,
    })
  }
}

export const getAllBlogs = async (req, res) => {
  try {
    // Lấy tất cả blog từ database
    const blogs = await Blog.find()
    console.log(blogs)
    // Trả về danh sách blog
    res.status(200).json({
      success: true,
      data: blogs,
    })
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({
      success: false,
      message: 'Error retrieving blogs',
      error: error.message,
    })
  }
}
