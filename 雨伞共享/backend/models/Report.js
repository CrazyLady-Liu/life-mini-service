const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  umbrella: { type: mongoose.Schema.Types.ObjectId, ref: 'Umbrella' },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  type: { type: String, enum: ['umbrella', 'station'], required: true },
  description: { type: String, required: true },
  images: [String],
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'resolved', 'closed'], 
    default: 'pending' 
  },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  handleResult: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
