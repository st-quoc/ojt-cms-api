import express from 'express'
import {
  adminCreateBlog,
  getAllBlogs,
  getBlogDetail,
  editBlog,
  deleteBlog,
} from '../../controllers/admin/blogController.js'

const Router = express.Router()

const validateId = (req, res, next) => {
  const { id } = req.params

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Blog ID.',
    })
  }

  next()
}

Router.route('/list').get(getAllBlogs)

Router.route('/create').post(adminCreateBlog)

Router.route('/detail/:id').get(validateId, getBlogDetail)

Router.route('/edit/:id').put(validateId, editBlog)

Router.route('/delete/:id').delete(validateId, deleteBlog)

export const blogAdminRoute = Router
