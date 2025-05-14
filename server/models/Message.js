import mongoose from 'mongoose';

// Define the Message schema
const messageSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride', // Reference to the Ride model
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, // Default to the current date/time
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Message model based on the schema
export default mongoose.model('Message', messageSchema);
