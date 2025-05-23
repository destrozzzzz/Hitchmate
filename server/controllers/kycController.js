import Kyc from '../models/Kyc.js';

export const submitKyc = async (req, res) => {
  try {
    const { fullName, idNumber, photoUrl } = req.body;
    const userId = req.user.id;

    const existing = await Kyc.findOne({ userId });
    if (existing) return res.status(400).json({ message: 'KYC already submitted.' });

    const newKyc = await Kyc.create({ userId, fullName, idNumber, photoUrl });
    res.status(201).json(newKyc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit KYC', error: err.message });
  }
};

export const getAllKycs = async (req, res) => {
  const kycs = await Kyc.find().populate('userId', 'email name');
  res.json(kycs);
};

export const updateKycStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await Kyc.findByIdAndUpdate(id, { status }, { new: true });
  res.json(updated);
};
