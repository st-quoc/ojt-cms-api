import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    address: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'manager', 'user'], required: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    refreshToken: { type: String },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
