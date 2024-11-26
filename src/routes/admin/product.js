import express from 'express'
import {
  requirePermission,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import { adminCreateProduct } from '../../controllers/admin/productController.js'
const Router = express.Router()

Router.route('/create').post(
  verifyAccessToken,
  requirePermission('create_product'),
  adminCreateProduct
)

export const productAdminRoute = Router
