import Message from '../models/Message.js';

// Controller to handle sending a message
export const sendMessage = async (req, res) => {
  try {
    const { rideId, sender, messageText } = req.body;

    // Validate sender and messageText
    if (!sender || !messageText) {
      return res.status(400).json({ message: 'Sender and message text are required' });
    }

    // Create and save the new message
    const newMessage = new Message({
      rideId,
      sender,  // Ensure sender is a valid string or user object
      text: messageText,
    });

    await newMessage.save();

    // Emit the message to all clients in the ride's room
    if (req.io) {
      req.io.to(rideId).emit('receive_message', {
        _id: newMessage._id,
        rideId,
        sender,
        text: messageText,
        timestamp: newMessage.timestamp,
      });
    } else {
      console.error('Socket.io instance not found');
    }

    // Return the saved message as response
    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error });
  }
};

// Controller to get all messages for a ride
export const getRideMessages = async (req, res) => {
  try {
    const { rideId } = req.params;

    // Fetch messages sorted by timestamp
    const messages = await Message.find({ rideId })
      .sort({ timestamp: 1 })  // Sort by time ascending
      .populate('sender', 'name');  // Populate sender with their name (not just ID)

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching ride messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};
