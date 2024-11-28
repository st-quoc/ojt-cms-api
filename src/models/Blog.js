import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], default: [] },
  status: { type: String, default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
})

const Blog = mongoose.model('Blog', BlogSchema)

export default Blog
