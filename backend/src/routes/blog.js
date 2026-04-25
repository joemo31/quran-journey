const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllPosts, getPostBySlug, createPost, updatePost, deletePost } = require('../controllers/blogController');
const router = express.Router();

router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticate, authorize('admin'), createPost);
router.put('/:id', authenticate, authorize('admin'), updatePost);
router.delete('/:id', authenticate, authorize('admin'), deletePost);

module.exports = router;
