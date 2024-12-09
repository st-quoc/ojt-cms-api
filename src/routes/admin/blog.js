import express from 'express'
import {
  createBlog,
  getAllBlogs,
  getDetailBlog,
  deleteBlog,
  changeBlogStatus,
} from '../../controllers/admin/blogController.js'
import {
  requirePermission,
  requireRole,
  verifyAccessToken,
} from '../../middlewares/authMiddleware.js'

const Router = express.Router()

Router.route('/list').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_blog', 'manager_blog']),
  getAllBlogs
)
Router.route('/detail/:id').get(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['view_blog', 'manager_blog']),
  getDetailBlog
)
Router.route('/edit/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_blog']),
  getDetailBlog
)
Router.route('/create').post(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_blog']),
  createBlog
)
Router.route('/delete/:id').delete(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_blog']),
  deleteBlog
)
Router.route('/change-status/:id').put(
  verifyAccessToken,
  requireRole(['admin', 'manager']),
  requirePermission(['manager_blog']),
  deleteBlog
)

export const blogAdminRoute = Router
