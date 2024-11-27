import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true },
  color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
})

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sortDesc: { type: String, required: true },
    fullDesc: { type: String, required: true },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ],
    images: { type: [String], required: true },
    variants: { type: [variantSchema], required: true },
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', productSchema)

export default Product
