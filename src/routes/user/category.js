import express from 'express'
import { getCategories } from '../../controllers/user/indexController.js'
const Router = express.Router()

Router.route('/list').get(getCategories)

export const categoryUserRoute = Router
