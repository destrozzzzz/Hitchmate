import Kyc from '../models/Kyc.js';

// POST /api/kyc/submit
export const submitKyc = async (req, res) => {
  try {
    const { fullName, idNumber, photoUrl } = req.body;

    if (!fullName || !idNumber || !photoUrl) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Optional duplicate check by ID number
    const existing = await Kyc.findOne({ idNumber });
    if (existing) {
      return res.status(400).json({ message: 'KYC with this ID number already submitted.' });
    }

    const newKyc = await Kyc.create({
      fullName,
      idNumber,
      photoUrl,
      userId: 'anonymous-user' // Optional field for traceability
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
    const kycs = await Kyc.find(); // No populate since userId is a string
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

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update KYC status', error: err.message });
  }
};
