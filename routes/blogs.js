const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { validateBlog } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = { status: 'published', isPublished: true };

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by tags
  if (req.query.tags) {
    const tags = req.query.tags.split(',');
    query.tags = { $in: tags };
  }

  // Filter by author
  if (req.query.author) {
    query.author = req.query.author;
  }

  const blogs = await Blog.find(query)
    .populate('author', 'name email avatar')
    .populate('commentCount')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.json({
    success: true,
    count: blogs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: blogs
  });
}));

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'name email avatar bio')
    .populate('commentCount')
    .populate('likeCount');

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Increment views
  await blog.incrementViews();

  res.json({
    success: true,
    data: blog
  });
}));

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
router.post('/', protect, validateBlog, asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.author = req.user._id;

  // Generate excerpt if not provided
  if (!req.body.excerpt && req.body.content) {
    req.body.excerpt = req.body.content.substring(0, 200) + '...';
  }

  const blog = await Blog.create(req.body);

  // Populate author info
  await blog.populate('author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    data: blog
  });
}));

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Owner or Admin)
router.put('/:id', protect, checkOwnership(Blog), validateBlog, asyncHandler(async (req, res) => {
  // Generate excerpt if content is updated and excerpt not provided
  if (req.body.content && !req.body.excerpt) {
    req.body.excerpt = req.body.content.substring(0, 200) + '...';
  }

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name email avatar');

  res.json({
    success: true,
    message: 'Blog updated successfully',
    data: blog
  });
}));

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, checkOwnership(Blog), asyncHandler(async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
}));

// @desc    Like/Unlike blog
// @route   PUT /api/blogs/:id/like
// @access  Private
router.put('/:id/like', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  await blog.toggleLike(req.user._id);

  res.json({
    success: true,
    message: 'Blog like toggled successfully',
    data: blog
  });
}));

// @desc    Get user's blogs
// @route   GET /api/blogs/user/:userId
// @access  Public
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find({ author: req.params.userId, status: 'published', isPublished: true })
    .populate('author', 'name email avatar')
    .populate('commentCount')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments({ author: req.params.userId, status: 'published', isPublished: true });

  res.json({
    success: true,
    count: blogs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: blogs
  });
}));

// @desc    Get current user's blogs (including drafts)
// @route   GET /api/blogs/my/blogs
// @access  Private
router.get('/my/blogs', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find({ author: req.user._id })
    .populate('author', 'name email avatar')
    .populate('commentCount')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments({ author: req.user._id });

  res.json({
    success: true,
    count: blogs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: blogs
  });
}));

// @desc    Get all blogs (Admin only)
// @route   GET /api/blogs/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find()
    .populate('author', 'name email avatar')
    .populate('commentCount')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments();

  res.json({
    success: true,
    count: blogs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: blogs
  });
}));

module.exports = router;
