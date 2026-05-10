const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  capacity: { type: Number, default: 20 },
  availableCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);
