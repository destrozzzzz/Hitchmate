import Ride from "../models/Ride.js";
import User from "../models/User.js";

// GET /api/rides/:id
export const getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('creator', 'name age stars rating profile ridesCreated createdAt')
      .lean();

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride);
  } catch (err) {
    next(err);
  }
};

// GET /api/rides
export const getAllRides = async (req, res, next) => {
  try {
    const rides = await Ride.find()
      .populate('creator', 'name stars')
      .lean();

    res.status(200).json(rides);
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/search
export const findRides = async (req, res, next) => {
  try {
    const { from, to, seat, date } = req.query;

    if (!from || !to || !seat || !date) {
      return res.status(400).json({ message: 'Please provide all the details' });
    }

    const parsedSeat = Number(seat);
    if (isNaN(parsedSeat) || parsedSeat < 1) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Do NOT mutate parsedDate
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const rides = await Ride.find({
      'origin.place': new RegExp(from, 'i'),
      'destination.place': new RegExp(to, 'i'),
      'availableSeats': { $gte: parsedSeat },
      'startTime': { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('creator', 'name profilePicture stars')
      .lean();

    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error('Find Rides Error:', err);
    next(err);
  }
};

// PATCH /api/rides/:id/join
export const joinRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.passengers.includes(req.user.id)) {
      return res.status(400).json({ message: "You already joined this ride!" });
    }

    if (ride.passengers.length >= ride.availableSeats) {
      return res.status(400).json({ message: "Ride is full!" });
    }

    await Ride.updateOne(
      { _id: ride._id },
      { $push: { passengers: req.user.id }, $inc: { availableSeats: -1 } }
    );

    await User.updateOne(
      { _id: req.user.id },
      { $push: { ridesJoined: ride._id } }
    );

    res.status(200).json({ message: "Successfully joined the ride!" });
  } catch (err) {
    next(err);
  }
};

// POST /api/rides
export const createRide = async (req, res, next) => {
  try {
    const newRide = new Ride({ ...req.body, creator: req.user.id });
    await newRide.save();
    await User.findByIdAndUpdate(req.user.id, {
      $push: { ridesCreated: newRide._id },
    });

    res.status(201).json(newRide);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/rides/:id
export const updateRide = async (req, res, next) => {
  try {
    const updated = await Ride.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body } },
      { new: true }
    );
    res.status(200).json({ success: true, ride: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rides/:id
export const deleteRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { ridesCreated: req.params.id },
    });
    res.status(200).json({ message: "Ride has been deleted" });
  } catch (err) {
    next(err);
  }
};
