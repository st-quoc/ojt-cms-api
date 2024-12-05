import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required.'],
      minlength: [10, 'Short description must be at least 10 characters long.'],
      maxlength: [200, 'Short description cannot exceed 200 characters.'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required.'],
      minlength: [20, 'Full description must be at least 20 characters long.'],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Blog = mongoose.model('Blog', BlogSchema)

export default Blog
