import express from 'express';
import {
  createPaymentUrl,
  handleVnpayReturn,
} from '../../controllers/payment/vnpayController.js';

const Router = express.Router();

// Route để tạo URL thanh toán VNPay
Router.route('/create-payment-url').post(createPaymentUrl);

// Route để xử lý callback từ VNPay
Router.route('/vnpay-return').get(handleVnpayReturn);

export const vnpayRoute = Router;
