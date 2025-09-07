const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide comment content'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    minlength: [1, 'Comment cannot be empty']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual for like count
commentSchema.virtual('likeCount', {
  ref: 'User',
  localField: 'likes',
  foreignField: '_id',
  count: true
});

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set editedAt when content is modified
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to get comments for a blog
commentSchema.statics.getCommentsForBlog = function(blogId) {
  return this.find({ 
    blog: blogId, 
    isActive: true,
    parentComment: null // Only get top-level comments
  })
    .populate('author', 'name email avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name email avatar'
      }
    })
    .sort({ createdAt: -1 });
};

// Static method to get replies for a comment
commentSchema.statics.getRepliesForComment = function(commentId) {
  return this.find({ 
    parentComment: commentId, 
    isActive: true 
  })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 }); // Sort replies chronologically
};

module.exports = mongoose.model('Comment', commentSchema);
