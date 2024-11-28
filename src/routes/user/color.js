import express from 'express'
import { getColors } from '../../controllers/user/indexController.js'
import { adminGetColorById } from '../../controllers/admin/colorController.js'
const Router = express.Router()

Router.route('/list').get(getColors)
Router.route('/:id').get(adminGetColorById)

export const colorUserRoute = Router
