import express from 'express';
import { submitKyc, getAllKycs, updateKycStatus } from '../controllers/kycController.js';
import { requireAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', requireAuth, submitKyc);
router.get('/all', isAdmin, getAllKycs);
router.patch('/update/:id', isAdmin, updateKycStatus);

export default router;
