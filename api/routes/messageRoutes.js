const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isLoggedIn } = require('../middleware/auth');

// Get all conversations for the current user
router.get('/conversations', isLoggedIn, messageController.getConversations);

// Get messages for a specific conversation
router.get('/:conversationId', isLoggedIn, messageController.getMessages);

// Send a message in an existing conversation
router.post('/', isLoggedIn, messageController.sendMessage);

// Start a new conversation
router.post('/start', isLoggedIn, messageController.startConversation);

// New route for unread message count
router.get('/unread-count', isLoggedIn, messageController.getUnreadMessageCount);

module.exports = router; 