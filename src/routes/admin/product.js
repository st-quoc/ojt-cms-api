import express from 'express'
import {
  requirePermission,
  requireRole,
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
  requirePermission(['view_product', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminGetListProduct
)

Router.route('/detail/:id').get(
  verifyAccessToken,
  requirePermission(['view_product', 'manager_product']),
  requireRole(['admin', 'manager']),
  adminGetProductDetail
)

Router.route('/create').post(
  verifyAccessToken,
  requirePermission(['manager_product']),
  requireRole(['admin', 'manager']),
  adminCreateProduct
)

Router.route('/delete/:id').delete(
  verifyAccessToken,
  requirePermission(['manager_product']),
  requireRole(['admin', 'manager']),
  adminDeleteProduct
)

Router.route('/edit/:id').put(
  verifyAccessToken,
  requirePermission(['manager_product']),
  requireRole(['admin', 'manager']),
  adminEditProduct
)

export const productAdminRoute = Router
