import { Schema } from 'mongoose'
import mongoose from 'mongoose'

const CartSchema = new Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      sizeId: { type: String, required: true },
      colorId: { type: String, required: true },
    },
  ],
})

const Cart = mongoose.model('Cart', CartSchema)

export default Cart
