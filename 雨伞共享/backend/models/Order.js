const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  umbrella: { type: mongoose.Schema.Types.ObjectId, ref: 'Umbrella', required: true },
  borrowStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  returnStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  borrowTime: { type: Date, default: Date.now },
  returnTime: Date,
  duration: Number,
  cost: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['ongoing', 'completed', 'cancelled', 'exception'], 
    default: 'ongoing' 
  },
  exceptionReason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
