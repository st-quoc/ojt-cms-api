import express from 'express'
import {
  createBlog,
  getAllBlogs,
  getDetailBlog,
  deleteBlog,
} from '../../controllers/admin/blogController.js'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

Router.route('/list').get(getAllBlogs)
Router.route('/detail/:id').get(verifyAccessToken, getDetailBlog)
Router.route('/edit/:id').put(verifyAccessToken, getDetailBlog)
Router.route('/create').post(createBlog)
Router.route('/delete/:id').delete(deleteBlog)
Router.route('/change-status/:id').put(deleteBlog)

export const blogAdminRoute = Router
