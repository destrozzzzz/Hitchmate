import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    rideId: {
      type: String, // Use string to match rideId passed from frontend
      required: true,
    },
    sender: {
      type: String, // Store sender as plain string for simplicity
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
