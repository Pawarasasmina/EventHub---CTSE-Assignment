const Booking = require('../models/Booking');
const { sendSuccess } = require('../utils/response');
const eventService = require('../services/eventService');
const notificationService = require('../services/notificationService');

const getBookingOr404 = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

const createBooking = async (req, res) => {
  const { eventId, ticketCount } = req.body;
  const event = await eventService.getEvent(eventId, req.token);

  if (!event || event.availableSeats < ticketCount) {
    return res.status(400).json({ success: false, message: 'Not enough seats available for this event' });
  }

  await eventService.reserveSeats(eventId, ticketCount, req.token);

  const booking = await Booking.create({
    userId: req.user.id,
    eventId,
    ticketCount,
    totalAmount: ticketCount * event.ticketPrice,
    status: 'confirmed'
  });

  await notificationService.createNotification(
    {
      userId: req.user.id,
      type: 'booking-confirmation',
      title: 'Booking Confirmed',
      message: `Your booking for ${event.title} has been confirmed.`,
      channel: 'in-app',
      relatedBookingId: booking._id.toString()
    },
    req.token
  );

  return sendSuccess(res, 201, 'Booking created successfully', {
    booking,
    eventSummary: {
      id: event._id,
      title: event.title,
      venue: event.venue,
      eventDate: event.eventDate,
      ticketPrice: event.ticketPrice
    }
  });
};

const getBookingsByUser = async (req, res) => {
  const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Bookings retrieved', bookings);
};

const getBookingById = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return sendSuccess(res, 200, 'Booking retrieved', booking);
};

const confirmBooking = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Cancelled booking cannot be confirmed' });
  }

  booking.status = 'confirmed';
  await booking.save();

  return sendSuccess(res, 200, 'Booking confirmed', booking);
};

const cancelBooking = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  }

  booking.status = 'cancelled';
  await booking.save();

  await eventService.releaseSeats(booking.eventId, booking.ticketCount, req.token);
  await notificationService.createNotification(
    {
      userId: booking.userId,
      type: 'booking-cancelled',
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled and seats were released.',
      channel: 'in-app',
      relatedBookingId: booking._id.toString()
    },
    req.token
  );

  return sendSuccess(res, 200, 'Booking cancelled successfully', booking);
};

module.exports = {
  createBooking,
  getBookingsByUser,
  getBookingById,
  confirmBooking,
  cancelBooking
};
