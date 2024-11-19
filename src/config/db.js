import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    // eslint-disable-next-line no-console
    console.log('MongoDB connected')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

export default connectDB
