const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
router.get('/:blogId', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if blog exists
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  const comments = await Comment.find({ 
    blog: req.params.blogId, 
    isActive: true,
    parentComment: null // Only get top-level comments
  })
    .populate('author', 'name email avatar')
    .populate('likeCount')
    .populate('repliesCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ 
    blog: req.params.blogId, 
    isActive: true,
    parentComment: null 
  });

  res.json({
    success: true,
    count: comments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: comments
  });
}));

// @desc    Get replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
router.get('/:commentId/replies', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const replies = await Comment.find({ 
    parentComment: req.params.commentId, 
    isActive: true 
  })
    .populate('author', 'name email avatar')
    .populate('likeCount')
    .sort({ createdAt: 1 }) // Sort replies chronologically
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ 
    parentComment: req.params.commentId, 
    isActive: true 
  });

  res.json({
    success: true,
    count: replies.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: replies
  });
}));

// @desc    Add comment to blog
// @route   POST /api/comments/:blogId
// @access  Private
router.post('/:blogId', protect, validateComment, asyncHandler(async (req, res) => {
  // Check if blog exists
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Add user and blog to req.body
  req.body.author = req.user._id;
  req.body.blog = req.params.blogId;

  const comment = await Comment.create(req.body);

  // Populate author info
  await comment.populate('author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment
  });
}));

// @desc    Reply to a comment
// @route   POST /api/comments/:commentId/reply
// @access  Private
router.post('/:commentId/reply', protect, validateComment, asyncHandler(async (req, res) => {
  // Check if parent comment exists
  const parentComment = await Comment.findById(req.params.commentId);
  if (!parentComment) {
    return res.status(404).json({
      success: false,
      message: 'Parent comment not found'
    });
  }

  // Add user, blog, and parent comment to req.body
  req.body.author = req.user._id;
  req.body.blog = parentComment.blog;
  req.body.parentComment = req.params.commentId;

  const reply = await Comment.create(req.body);

  // Populate author info
  await reply.populate('author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Reply added successfully',
    data: reply
  });
}));

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Owner or Admin)
router.put('/:id', protect, checkOwnership(Comment, 'id'), validateComment, asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name email avatar');

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: comment
  });
}));

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, checkOwnership(Comment, 'id'), asyncHandler(async (req, res) => {
  // Soft delete - set isActive to false
  await Comment.findByIdAndUpdate(req.params.id, { isActive: false });

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// @desc    Like/Unlike comment
// @route   PUT /api/comments/:id/like
// @access  Private
router.put('/:id/like', protect, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  await comment.toggleLike(req.user._id);

  res.json({
    success: true,
    message: 'Comment like toggled successfully',
    data: comment
  });
}));

// @desc    Get user's comments
// @route   GET /api/comments/user/:userId
// @access  Public
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ 
    author: req.params.userId, 
    isActive: true 
  })
    .populate('author', 'name email avatar')
    .populate('blog', 'title')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ 
    author: req.params.userId, 
    isActive: true 
  });

  res.json({
    success: true,
    count: comments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: comments
  });
}));

// @desc    Get all comments (Admin only)
// @route   GET /api/comments/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find()
    .populate('author', 'name email avatar')
    .populate('blog', 'title')
    .populate('likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments();

  res.json({
    success: true,
    count: comments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: comments
  });
}));

module.exports = router;
