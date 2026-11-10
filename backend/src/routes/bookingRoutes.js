import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);
router.put('/:id/status', authorize('admin', 'manager'), updateBookingStatus);

export default router;
