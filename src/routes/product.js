import express from 'express'
import { requirePermission, verifyAccessToken } from '~/middlewares/authMiddleware'
const Router = express.Router()

// Router.route('/product/get_all').post(register)


// Protected route requiring 'manage_products' permission
Router.route('/product').get(
  verifyAccessToken,
  requirePermission('manage_products'),
  (req, res) => {
    res.json({ message: 'Access granted to manage products' })
  }
)

export const productRoute = Router
