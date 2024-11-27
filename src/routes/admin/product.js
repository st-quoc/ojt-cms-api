import express from 'express'
import {
  requirePermission,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminEditProduct,
  adminGetListProduct,
  adminGetProductDetail,
} from '../../controllers/admin/productController.js'
const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requirePermission('create_product'),
  adminGetListProduct
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requirePermission('create_product'),
  adminGetProductDetail
)

Router.route('/create').post(
  verifyAccessToken,
  requirePermission('create_product'),
  adminCreateProduct
)

Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission('create_product'),
  adminDeleteProduct
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requirePermission('create_product'),
  adminEditProduct
)

export const productAdminRoute = Router
