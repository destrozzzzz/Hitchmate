import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous-user' }, // now optional and just a string
  fullName: String,
  idNumber: String,
  photoUrl: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.model('Kyc', kycSchema);
