const Event = require('../models/Event');
const { sendSuccess } = require('../utils/response');

const getEvents = async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (typeof req.query.published !== 'undefined') {
    filter.isPublished = req.query.published === 'true';
  }

  const events = await Event.find(filter).sort({ eventDate: 1 });
  return sendSuccess(res, 200, 'Events retrieved', events);
};

const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  return sendSuccess(res, 200, 'Event retrieved', event);
};

const createEvent = async (req, res) => {
  const payload = { ...req.body, organizerId: req.user.id };
  payload.availableSeats = payload.totalSeats;

  const event = await Event.create(payload);
  return sendSuccess(res, 201, 'Event created successfully', event);
};

const updateEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (req.user.role === 'organizer' && event.organizerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only update your own events' });
  }

  const previousTotal = event.totalSeats;
  Object.assign(event, req.body);

  if (typeof req.body.totalSeats !== 'undefined') {
    const reservedSeats = previousTotal - event.availableSeats;
    if (req.body.totalSeats < reservedSeats) {
      return res.status(400).json({ success: false, message: 'Total seats cannot be less than reserved seats' });
    }

    event.availableSeats = req.body.totalSeats - reservedSeats;
  }

  await event.save();
  return sendSuccess(res, 200, 'Event updated successfully', event);
};

const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (req.user.role === 'organizer' && event.organizerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only delete your own events' });
  }

  await event.deleteOne();
  return sendSuccess(res, 200, 'Event deleted successfully');
};

const reserveSeats = async (req, res) => {
  const { seats } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (event.availableSeats < seats) {
    return res.status(400).json({ success: false, message: 'Not enough seats available' });
  }

  event.availableSeats -= seats;
  await event.save();

  return sendSuccess(res, 200, 'Seats reserved successfully', event);
};

const releaseSeats = async (req, res) => {
  const { seats } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  event.availableSeats = Math.min(event.totalSeats, event.availableSeats + seats);
  await event.save();

  return sendSuccess(res, 200, 'Seats released successfully', event);
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reserveSeats,
  releaseSeats
};
