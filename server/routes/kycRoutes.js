import express from 'express';
import { submitKyc, getAllKycs, updateKycStatus } from '../controllers/kycController.js';

const router = express.Router();

// Allow public KYC submission (no auth)
router.post('/submit', submitKyc);

// Simple admin password check via query param
router.get('/all', (req, res, next) => {
  const adminPassword = req.query.auth;
  if (adminPassword !== 'admin123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getAllKycs(req, res, next);
});

router.patch('/update/:id', (req, res, next) => {
  const adminPassword = req.query.auth;
  if (adminPassword !== 'admin123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  updateKycStatus(req, res, next);
});

export default router;
