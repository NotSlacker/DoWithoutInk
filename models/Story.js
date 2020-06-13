const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author'
    },
    username: {
      type: String,
      required: true,
      trim: true
    }
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  created: {
    type: Date,
    default: Date.now()
  }
}, {
  collection: 'stories'
});

module.exports = mongoose.model('story', storySchema);