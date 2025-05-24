import User from "../models/User.js";

// Get a single user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('ridesCreated ridesJoined').lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const { email, password, updatedAt, ...detail } = user;
    res.status(200).json(detail);
  } catch (err) {
    next(err);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      profilePicture,
      age,
      profile = {},
    } = req.body;

    // Build update object using dot notation for nested fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;
    if (age !== undefined) updateFields.age = age;

    if (profile.bio !== undefined) updateFields['profile.bio'] = profile.bio;
    if (profile.preferences) {
      if (profile.preferences.smoking !== undefined)
        updateFields['profile.preferences.smoking'] = profile.preferences.smoking;
      if (profile.preferences.music !== undefined)
        updateFields['profile.preferences.music'] = profile.preferences.music;
      if (profile.preferences.petFriendly !== undefined)
        updateFields['profile.preferences.petFriendly'] = profile.preferences.petFriendly;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
