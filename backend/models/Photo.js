import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  userId: {
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
  imageUrl: {
    type: String, // Base64 o URL
    required: true
  },
  moonPhase: {
    type: Number,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  metadata: {
    camera: String,
    lens: String,
    iso: String,
    exposure: String,
    aperture: String
  },
  likes: [{
    type: String // Array de userIds
  }],
  comments: [{
    userId: String,
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

export const Photo = mongoose.model('Photo', photoSchema);
