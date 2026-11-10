import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleCategories,
  getLocations,
} from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllVehicles);
router.get('/categories', getVehicleCategories);
router.get('/locations', getLocations);
router.get('/:id', getVehicleById);

// Admin & Manager fleet management routes
router.post('/', authenticate, authorize('admin', 'manager'), createVehicle);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateVehicle);
router.delete('/:id', authenticate, authorize('admin'), deleteVehicle);

export default router;
