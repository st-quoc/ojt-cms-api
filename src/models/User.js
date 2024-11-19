import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  refreshToken: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] }
})

export default mongoose.model('User', userSchema)
