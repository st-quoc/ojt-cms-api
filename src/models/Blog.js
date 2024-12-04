import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema(
  {
    thumbnail: { type: String, require: true },
    title: { type: String, required: true },
    sortDesc: { type: String, required: true },
    fullDesc: { type: String, required: true },
    status: { type: String, default: 'draft', enum: ['draft', 'public'] },
  },
  { timestamps: true }
)

const Blog = mongoose.model('Blog', BlogSchema)

export default Blog
