import express from 'express';
import { getMaintenanceRecords, createMaintenanceRecord } from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/', getMaintenanceRecords);
router.post('/', createMaintenanceRecord);

export default router;
