import express from 'express';
import { getPayments, simulatePayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPayments);
router.post('/simulate', simulatePayment);

export default router;
