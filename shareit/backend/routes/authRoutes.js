const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Register new user
router.post('/register', (req, res) => authController.register(req, res));

// Login user
router.post('/login', (req, res) => authController.login(req, res));

// Get current user profile
router.get('/profile', auth, (req, res) => authController.getCurrentUser(req, res));

module.exports = router; 