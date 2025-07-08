const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// User management routes
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Post management routes
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);

// Announcement routes
router.post('/announcements', adminController.createAnnouncement);

module.exports = router; 