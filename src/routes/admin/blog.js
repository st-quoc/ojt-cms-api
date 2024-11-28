import express from 'express'
import {
  adminCreateBlog,
  getAllBlogs,
} from '../../controllers/admin/blogController.js'

const Router = express.Router()

Router.route('/list').get(getAllBlogs)
Router.route('/create').post(adminCreateBlog)

export const blogAdminRoute = Router
