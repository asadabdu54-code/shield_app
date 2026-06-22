const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['keyword', 'domain', 'app', 'regex'],
      required: true,
    },
    value: {
      type: String,
      required: [true, 'Rule value is required'],
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastTriggered: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rule', ruleSchema);
