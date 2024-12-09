import express from 'express'
import { detail, list } from '../../controllers/user/blogController'
const Router = express.Router()

Router.route('/list').get(list)
Router.route('/detail').get(detail)

export const blogUserRoute = Router
