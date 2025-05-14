import express from 'express';
import { sendMessage, getRideMessages } from '../controllers/message.js';

const router = express.Router();

// Route to send a new message
router.post('/send', sendMessage);

// Route to fetch all messages for a specific ride
router.get('/:rideId/messages', getRideMessages);

export default router;
