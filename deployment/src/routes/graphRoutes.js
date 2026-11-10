import express from 'express';
import {
  getRecommendedVehicles,
  getSimilarCustomers,
  getPopularGraphCategories,
} from '../controllers/graphController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/recommendations', getRecommendedVehicles);
router.get('/similar-customers', getSimilarCustomers);
router.get('/popular-categories', getPopularGraphCategories);

export default router;
