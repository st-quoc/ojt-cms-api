import express from 'express';
import { getListProducts } from '../../controllers/user/productController.js';

const Router = express.Router();

Router.route('/list_products').get(getListProducts);

export const publicRoute = Router;
