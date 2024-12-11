import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    resetPassword: {
      token: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
    address: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      required: true,
      default: 'user',
    },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    refreshToken: { type: String },
    phoneNumber: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    totalSpent: { type: Number, default: 0 },
    tier: { type: mongoose.Schema.Types.ObjectId, ref: 'Tier' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
