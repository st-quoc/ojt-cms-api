import mongoose from 'mongoose'

const sizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

const Size = mongoose.model('Size', sizeSchema)

export default Size
