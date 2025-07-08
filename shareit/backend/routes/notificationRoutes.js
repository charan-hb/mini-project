const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Get only announcement notifications for a user
router.get('/announcements', notificationController.getUserAnnouncements);

module.exports = router; 