const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    organizerId: { type: String, required: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true, trim: true },
    eventVenue: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    ticketCount: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    bookedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
