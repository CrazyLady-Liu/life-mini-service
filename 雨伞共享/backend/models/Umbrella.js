const mongoose = require('mongoose');

const umbrellaSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  status: { 
    type: String, 
    enum: ['available', 'in_use', 'maintenance', 'lost'], 
    default: 'available' 
  },
  battery: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 },
  lastMaintenance: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Umbrella', umbrellaSchema);
