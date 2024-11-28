import express from 'express'
import { getSizes } from '../../controllers/user/indexController.js'
import { adminGetSizeById } from '../../controllers/admin/sizeController.js'
const Router = express.Router()

Router.route('/list').get(getSizes)
Router.route('/:id').get(adminGetSizeById)
export const sizeUserRoute = Router
