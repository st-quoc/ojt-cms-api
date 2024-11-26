import mongoose from 'mongoose'

const permissionSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String, required: true },
})

export default mongoose.model('Permission', permissionSchema)
