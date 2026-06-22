const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    threatsBlocked: {
      type: Number,
      default: 0,
    },
    adsBlocked: {
      type: Number,
      default: 0,
    },
    phishingAttempts: {
      type: Number,
      default: 0,
    },
    dataLeaksPrevented: {
      type: Number,
      default: 0,
    },
    topBlockedDomains: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// One report per user per day
reportSchema.index({ owner: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
