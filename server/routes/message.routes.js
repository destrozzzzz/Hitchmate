import express from 'express';
import { sendMessage, getRideMessages } from '../controllers/message.js';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/:rideId/messages', getRideMessages);

export default router;
