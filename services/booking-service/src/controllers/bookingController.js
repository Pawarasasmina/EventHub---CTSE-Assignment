const Booking = require('../models/Booking');
const { sendSuccess } = require('../utils/response');
const eventService = require('../services/eventService');
const notificationService = require('../services/notificationService');
const authService = require('../services/authService');

const getBookingOr404 = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

const canManageBooking = (user, booking) => user.role === 'admin' || booking.organizerId === user.id;
const canAccessBooking = (user, booking) => user.role === 'admin' || booking.userId === user.id || booking.organizerId === user.id;

const dedupeRecipients = (recipients) => {
  const seen = new Set();
  return recipients.filter((recipient) => {
    if (!recipient?.userId || seen.has(recipient.userId)) {
      return false;
    }
    seen.add(recipient.userId);
    return true;
  });
};

const buildNotification = (userId, booking, payload) => ({
  userId,
  channel: 'in-app',
  relatedBookingId: booking._id.toString(),
  ...payload
});

const getAdminRecipients = async (token) => {
  const admins = await authService.listAdmins(token);
  return admins.map((admin) => admin.id.toString());
};

const notifyBookingStakeholders = async ({ booking, token, customerNotification, organizerNotification, adminNotification, excludeUserIds = [] }) => {
  const adminRecipients = adminNotification ? await getAdminRecipients(token) : [];
  const notifications = dedupeRecipients([
    customerNotification ? { userId: booking.userId, payload: customerNotification } : null,
    organizerNotification ? { userId: booking.organizerId, payload: organizerNotification } : null,
    ...adminRecipients.map((adminId) => ({ userId: adminId, payload: adminNotification }))
  ]).filter((item) => !excludeUserIds.includes(item.userId)).map((item) => buildNotification(item.userId, booking, item.payload));

  if (!notifications.length) {
    return [];
  }

  return notificationService.createNotifications(notifications, token);
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
    organizerId: event.organizerId,
    eventId,
    eventTitle: event.title,
    eventVenue: event.venue,
    eventDate: event.eventDate,
    ticketCount,
    totalAmount: ticketCount * event.ticketPrice,
    status: 'pending'
  });

  await notifyBookingStakeholders({
    booking,
    token: req.token,
    customerNotification: {
      type: 'booking-pending',
      title: 'Booking Pending Approval',
      message: `Your booking request for ${event.title} is waiting for organizer confirmation.`
    },
    organizerNotification: {
      type: 'event-booking-request',
      title: 'New Booking Request',
      message: `A customer requested ${ticketCount} ticket(s) for ${event.title}. Review it from the approval queue.`
    },
    adminNotification: {
      type: 'admin-booking-request',
      title: 'Booking Request Logged',
      message: `A new booking request was created for ${event.title}.`
    }
  });

  return sendSuccess(res, 201, 'Booking request created successfully', {
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

const getApprovalQueue = async (req, res) => {
  if (!['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only organizers or admins can review booking approvals' });
  }

  const query = req.user.role === 'admin' ? { status: 'pending' } : { status: 'pending', organizerId: req.user.id };
  const bookings = await Booking.find(query).sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Approval queue retrieved', bookings);
};

const getManagedBookings = async (req, res) => {
  if (!['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only organizers or admins can view managed bookings' });
  }

  const query = req.user.role === 'admin' ? {} : { organizerId: req.user.id };
  const bookings = await Booking.find(query).sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Managed bookings retrieved', bookings);
};

const getBookingById = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (!canAccessBooking(req.user, booking)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return sendSuccess(res, 200, 'Booking retrieved', booking);
};

const confirmBooking = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (!canManageBooking(req.user, booking)) {
    return res.status(403).json({ success: false, message: 'Only the organizer or admin can confirm this booking' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending bookings can be confirmed' });
  }

  booking.status = 'confirmed';
  await booking.save();

  await notificationService.createNotification(
    buildNotification(booking.userId, booking, {
      type: 'booking-confirmation',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.eventTitle} has been approved and confirmed.`
    }),
    req.token
  );

  return sendSuccess(res, 200, 'Booking confirmed', booking);
};

const rejectBooking = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (!canManageBooking(req.user, booking)) {
    return res.status(403).json({ success: false, message: 'Only the organizer or admin can reject this booking' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending bookings can be rejected' });
  }

  booking.status = 'rejected';
  await booking.save();

  await eventService.releaseSeats(booking.eventId, booking.ticketCount, req.token);
  await notificationService.createNotification(
    buildNotification(booking.userId, booking, {
      type: 'booking-rejected',
      title: 'Booking Rejected',
      message: `Your booking request for ${booking.eventTitle} was rejected and the reserved seats were released.`
    }),
    req.token
  );

  return sendSuccess(res, 200, 'Booking rejected', booking);
};

const cancelBooking = async (req, res) => {
  const booking = await getBookingOr404(req.params.id);

  if (!canAccessBooking(req.user, booking)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (['cancelled', 'rejected'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'This booking cannot be cancelled' });
  }

  const previousStatus = booking.status;
  booking.status = 'cancelled';
  await booking.save();

  if (['pending', 'confirmed'].includes(previousStatus)) {
    await eventService.releaseSeats(booking.eventId, booking.ticketCount, req.token);
  }

  await notifyBookingStakeholders({
    booking,
    token: req.token,
    customerNotification: {
      type: 'booking-cancelled',
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.eventTitle} has been cancelled and seats were released.`
    },
    organizerNotification: {
      type: 'event-booking-cancelled',
      title: 'Booking Cancelled For Your Event',
      message: `A booking for ${booking.eventTitle} was cancelled and seats were released.`
    },
    adminNotification: {
      type: 'admin-booking-cancelled',
      title: 'Booking Cancelled',
      message: `A booking for ${booking.eventTitle} was cancelled.`
    }
  });

  return sendSuccess(res, 200, 'Booking cancelled successfully', booking);
};

module.exports = {
  createBooking,
  getBookingsByUser,
  getApprovalQueue,
  getManagedBookings,
  getBookingById,
  confirmBooking,
  rejectBooking,
  cancelBooking
};
