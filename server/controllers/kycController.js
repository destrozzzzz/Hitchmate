import Kyc from '../models/Kyc.js';

// POST /api/kyc/submit
export const submitKyc = async (req, res) => {
  try {
    const { fullName, idNumber, photoUrl } = req.body;

    if (!fullName || !idNumber || !photoUrl) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Prevent duplicate ID numbers
    const existing = await Kyc.findOne({ idNumber });
    if (existing) {
      return res.status(400).json({ message: 'KYC with this ID number already submitted.' });
    }

    const newKyc = await Kyc.create({
      fullName,
      idNumber,
      photoUrl,
      userId: 'anonymous-user', // Optional field
      status: 'pending',
    });

    res.status(201).json({ message: 'KYC submitted successfully', data: newKyc });
  } catch (err) {
    console.error('KYC Submission Error:', err);
    res.status(500).json({ message: 'Failed to submit KYC', error: err.message });
  }
};

// GET /api/kyc
export const getAllKycs = async (req, res) => {
  try {
    const kycs = await Kyc.find().sort({ createdAt: -1 });
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch KYCs', error: err.message });
  }
};

// PATCH /api/kyc/:id/status
export const updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updated = await Kyc.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'KYC not found.' });
    }

    res.json({ message: 'KYC status updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update KYC status', error: err.message });
  }
};

// DELETE /api/kyc/:id
export const deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Kyc.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'KYC not found.' });
    }

    res.json({ message: 'KYC deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete KYC', error: err.message });
  }
};
