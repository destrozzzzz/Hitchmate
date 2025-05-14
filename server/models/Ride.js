import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  availableSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  origin: {
    place: {
      type: String, 
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  destination: {
    place: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'canceled'],
    default: 'pending',
  },
  price: {
    type: Number, 
  },
  vehicleDetails: {
    vehicleNumber: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
  },
  chat: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Ensures a sender is always specified
      },
      message: {
        type: String,
        required: true, // Ensure every chat message has content
      },
      timestamp: {
        type: Date,
        default: Date.now, // Automatically sets the timestamp if not provided
      },
    },
  ],
}, { timestamps: true });

export default mongoose.model('Ride', rideSchema);
