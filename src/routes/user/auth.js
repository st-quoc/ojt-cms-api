import express from 'express'
import { register, login } from '../../controllers/user/authController.js'

const Router = express.Router()

// Route đăng ký
Router.route('/register').post(register)

// Route đăng nhập
Router.route('/login').post(login)

export const authUserRoute = Router
