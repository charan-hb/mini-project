const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// Get or create chat with a user
router.get('/with/:userId', auth, (req, res) => chatController.getOrCreateChat(req, res));

// Get all chats for current user
router.get('/', auth, (req, res) => chatController.getUserChats(req, res));

// Get single chat
router.get('/:id', auth, (req, res) => chatController.getChat(req, res));

// Send message in chat
router.post('/:id/messages', auth, (req, res) => chatController.sendMessage(req, res));

module.exports = router; 