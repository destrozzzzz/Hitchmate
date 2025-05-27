import express from 'express';
import {
  submitKyc,
  getAllKycs,
  updateKycStatus,
  deleteKyc
} from '../controllers/kycController.js';

const router = express.Router();

// Public KYC submission
router.post('/submit', submitKyc);

// Admin middleware check
const adminAuthMiddleware = (req, res, next) => {
  if (req.query.auth !== 'admin123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Admin routes
router.get('/', adminAuthMiddleware, getAllKycs);
router.patch('/:id/status', adminAuthMiddleware, updateKycStatus);
router.delete('/:id', adminAuthMiddleware, deleteKyc);

export default router;
