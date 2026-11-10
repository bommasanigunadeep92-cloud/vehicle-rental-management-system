import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin', 'manager'), getDashboardAnalytics);

export default router;
