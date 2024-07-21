const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  sentiment: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);