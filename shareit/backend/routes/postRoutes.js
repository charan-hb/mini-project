const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth');

// Create a new post
router.post('/', auth, (req, res) => postController.createPost(req, res));

// Get all posts
router.get('/', auth, (req, res) => postController.getPosts(req, res));

// Get a single post
router.get('/:id', auth, (req, res) => postController.getPost(req, res));

// Update a post
router.put('/:id', auth, (req, res) => postController.updatePost(req, res));

// Delete a post
router.delete('/:id', auth, (req, res) => postController.deletePost(req, res));

// Express interest in a post
router.post('/:id/interest', auth, (req, res) => postController.handleInterest(req, res));

module.exports = router; 