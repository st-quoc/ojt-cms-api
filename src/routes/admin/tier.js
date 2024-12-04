import express from 'express'
import { verifyAccessToken } from '../../middlewares/authMiddleware.js'
import {
  adminCreateTier,
  adminDeleteTier,
  adminGetListTier,
  adminGetTierById,
  adminUpdateTier,
} from '../../controllers/admin/tierController.js'
const Router = express.Router()

Router.route('/list').get(verifyAccessToken, adminGetListTier)
Router.route('/create').post(verifyAccessToken, adminCreateTier)
Router.route('/detail/:id').get(verifyAccessToken, adminGetTierById)
Router.route('/update/:id').put(verifyAccessToken, adminUpdateTier)
Router.route('/delete/:id').delete(verifyAccessToken, adminDeleteTier)

export const tierAdminRoute = Router
