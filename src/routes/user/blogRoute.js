import express from 'express'
import { detail, list } from '../../controllers/user/blogController.js'
const Router = express.Router()

Router.route('/list').get(list)
Router.route('/detail/:id').get(detail)

export const blogUserRoute = Router
