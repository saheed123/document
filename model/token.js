const mongoose = require('mongoose');
const TokenSchema = new mongoose.Schema({
  _userId: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'USER' }] ,
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 3600 }
});
const tokens = mongoose.model('Token', TokenSchema);
module.exports = tokens;
