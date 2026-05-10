const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: { type: String, required: true, unique: true },
  nickname: String,
  avatar: String,
  phone: String,
  deposit: { type: Number, default: 0 },
  creditScore: { type: Number, default: 100 },
  isFreeDeposit: { type: Boolean, default: false },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
