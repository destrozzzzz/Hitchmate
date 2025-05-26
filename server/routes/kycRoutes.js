import express from 'express';
import { submitKyc, getAllKycs, updateKycStatus } from '../controllers/kycController.js';

const router = express.Router();

// Public KYC submission (no auth)
router.post('/submit', submitKyc);

// Admin-only access using query param ?auth=admin123
router.get('/', (req, res, next) => {
  const adminPassword = req.query.auth;
  if (adminPassword !== 'admin123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getAllKycs(req, res, next);
});

router.patch('/:id/status', (req, res, next) => {
  const adminPassword = req.query.auth;
  if (adminPassword !== 'admin123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  updateKycStatus(req, res, next);
});

export default router;
