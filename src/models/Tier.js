import mongoose from 'mongoose'

const tierSchema = new mongoose.Schema(
  {
    image: { type: String },
    name: { type: String, required: true },
    minSpent: { type: Number, required: true },
    maxSpent: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

const Tier = mongoose.model('Tier', tierSchema)

export default Tier
