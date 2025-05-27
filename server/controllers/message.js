import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { rideId, sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: 'Sender and message text are required' });
    }

    const newMessage = new Message({ rideId, sender, text });
    await newMessage.save();

    if (req.io) {
      req.io.to(rideId).emit('receive_message', {
        ...newMessage.toObject(),
        timestamp: newMessage.timestamp,
      });
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error });
  }
};

export const getRideMessages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const messages = await Message.find({ rideId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching ride messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};
