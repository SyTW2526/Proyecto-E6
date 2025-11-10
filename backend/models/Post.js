import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  likes: [{
    type: String // Array de userIds
  }],
  comments: [{
    userId: String,
    userName: String,
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

export const Post = mongoose.model('Post', postSchema);
