import express from 'express';
import { getAllCustomers, updateCustomerStatus } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/', getAllCustomers);
router.put('/:id/status', updateCustomerStatus);

export default router;
