import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRoute } from './admin/auth.js';
import { productRoute } from './admin/product.js';
import { managerRoute } from './admin/manager.js';
import { publicRoute } from './user/public.js';
import { vnpayRoute } from './vnpay/payment.js';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' });
});

Router.use('/auth', authRoute);
Router.use('/product', productRoute);
Router.use('/manager', managerRoute);

Router.use('/public', publicRoute);
Router.use('/vnpay', vnpayRoute);

export const APIs_V1 = Router;
