import express from 'express'
import { login, register } from '../../controllers/user/authController.js'

const Router = express.Router()

Router.route('/login').post(login)
Router.route('/register').post(register)

export const userRoute = Router
