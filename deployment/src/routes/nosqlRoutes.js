import express from 'express';
import {
  getActivityLogs,
  getVehicleSpecs,
  updateVehicleSpecs,
  getRentalDocuments,
  saveRentalDocument,
} from '../controllers/nosqlController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/activity-logs', authorize('admin', 'manager'), getActivityLogs);
router.get('/specs/:vehicleId', getVehicleSpecs);
router.put('/specs/:vehicleId', authorize('admin', 'manager'), updateVehicleSpecs);
router.get('/documents/:bookingId', getRentalDocuments);
router.post('/documents', saveRentalDocument);

export default router;
