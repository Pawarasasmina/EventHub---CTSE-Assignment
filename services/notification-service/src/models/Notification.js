const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    channel: { type: String, default: 'in-app' },
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed'],
      default: 'queued'
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    relatedBookingId: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
