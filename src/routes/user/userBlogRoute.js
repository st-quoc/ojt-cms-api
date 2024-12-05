import express from 'express'
import {
  getUserBlogs,
  getUserBlogDetail,
} from '../../controllers/user/UserBlogController.js'

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

Router.route('/list').get(getUserBlogs)

Router.route('/detail/:id').get(validateId, getUserBlogDetail)

export const userBlogRoute = Router
