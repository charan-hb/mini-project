const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');

// Create a new post
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['looking-for-teammates', 'offering-help']).withMessage('Invalid post type'),
  body('projectName').if(body('type').equals('looking-for-teammates')).notEmpty().withMessage('Project name is required for team posts'),
  body('requiredSkills').isArray().withMessage('Required skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, projectName, requiredSkills } = req.body;

    const post = new Post({
      title,
      description,
      type,
      projectName,
      requiredSkills,
      author: req.user._id
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts with filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, skills, department, year } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }
    if (skills) {
      query.requiredSkills = { $in: skills.split(',') };
    }

    const posts = await Post.find(query)
      .populate('author', 'name department year skills')
      .sort({ createdAt: -1 });

    // Filter by department and year if provided
    let filteredPosts = posts;
    if (department || year) {
      filteredPosts = posts.filter(post => {
        const author = post.author;
        if (department && author.department !== department) return false;
        if (year && author.year !== parseInt(year)) return false;
        return true;
      });
    }

    res.json(filteredPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name department year skills');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.description = description || post.description;
    if (status) post.status = status;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to get all posts
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 