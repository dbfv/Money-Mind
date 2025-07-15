const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Bank Account", "E-Wallet", "Cash", "Other"],
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Locked", "Not Available"],
    default: "Available",
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    trim: true,
    default: '',
  },
  transferTime: {
    type: String,
    default: 'Instant', // Allow custom labels for wait time
  },
}, {
  timestamps: true,
});

const Source = mongoose.model("Source", sourceSchema);

module.exports = Source;
