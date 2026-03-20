const test = require('node:test');
const path = require('node:path');
const { assert, createRes, loadWithMocks } = require('./helpers');

const controllerPath = path.resolve(__dirname, '../services/booking-service/src/controllers/bookingController.js');
const bookingModelPath = require.resolve('../services/booking-service/src/models/Booking');
const eventServicePath = require.resolve('../services/booking-service/src/services/eventService');
const notificationServicePath = require.resolve('../services/booking-service/src/services/notificationService');
const authServicePath = require.resolve('../services/booking-service/src/services/authService');

const createBookingDoc = (overrides = {}) => ({
  _id: 'booking-1',
  userId: 'user-1',
  organizerId: 'organizer-1',
  eventId: 'event-1',
  eventTitle: 'Test Event',
  ticketCount: 2,
  status: 'pending',
  save: async function save() { return this; },
  ...overrides
});

const createController = ({ Booking, eventService, notificationService, authService }) => loadWithMocks(
  controllerPath,
  new Map([
    [bookingModelPath, Booking],
    [eventServicePath, eventService],
    [notificationServicePath, notificationService],
    [authServicePath, authService]
  ])
);

test('booking createBooking rejects when seats are not available', async () => {
  const Booking = { create: async () => { throw new Error('should not create'); } };
  const eventService = {
    getEvent: async () => ({ availableSeats: 0 }),
    reserveSeats: async () => {}
  };
  const notificationService = { createNotifications: async () => [] };
  const authService = { listAdmins: async () => [] };
  const { createBooking } = createController({ Booking, eventService, notificationService, authService });
  const res = createRes();

  await createBooking({ body: { eventId: 'event-1', ticketCount: 2 }, user: { id: 'user-1' }, token: 'token' }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Not enough seats available for this event');
});

test('booking createBooking creates pending booking and stakeholder notifications', async () => {
  const createdBooking = createBookingDoc();
  let reservedArgs;
  let notificationPayloads;
  const Booking = { create: async (payload) => ({ ...createdBooking, ...payload }) };
  const eventService = {
    getEvent: async () => ({
      _id: 'event-1',
      organizerId: 'organizer-1',
      title: 'Test Event',
      venue: 'Main Hall',
      eventDate: '2026-03-21T10:00:00.000Z',
      ticketPrice: 50,
      availableSeats: 20
    }),
    reserveSeats: async (eventId, seats) => {
      reservedArgs = { eventId, seats };
      return {};
    }
  };
  const notificationService = {
    createNotifications: async (payloads) => {
      notificationPayloads = payloads;
      return payloads;
    }
  };
  const authService = { listAdmins: async () => [{ id: 'admin-1' }] };
  const { createBooking } = createController({ Booking, eventService, notificationService, authService });
  const res = createRes();

  await createBooking({ body: { eventId: 'event-1', ticketCount: 2 }, user: { id: 'user-1' }, token: 'token' }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.deepEqual(reservedArgs, { eventId: 'event-1', seats: 2 });
  assert.equal(notificationPayloads.length, 3);
  assert.equal(res.body.data.booking.status, 'pending');
});

test('booking confirmBooking rejects non-pending bookings', async () => {
  const Booking = { findById: async () => createBookingDoc({ status: 'confirmed' }) };
  const eventService = {};
  const notificationService = { createNotification: async () => ({}) };
  const authService = { listAdmins: async () => [] };
  const { confirmBooking } = createController({ Booking, eventService, notificationService, authService });
  const res = createRes();

  await confirmBooking({ params: { id: 'booking-1' }, user: { id: 'organizer-1', role: 'organizer' }, token: 'token' }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Only pending bookings can be confirmed');
});

test('booking confirmBooking confirms pending booking', async () => {
  const booking = createBookingDoc({ status: 'pending' });
  let notificationPayload;
  const Booking = { findById: async () => booking };
  const eventService = {};
  const notificationService = {
    createNotification: async (payload) => {
      notificationPayload = payload;
      return payload;
    }
  };
  const authService = { listAdmins: async () => [] };
  const { confirmBooking } = createController({ Booking, eventService, notificationService, authService });
  const res = createRes();

  await confirmBooking({ params: { id: 'booking-1' }, user: { id: 'organizer-1', role: 'organizer' }, token: 'token' }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(booking.status, 'confirmed');
  assert.equal(notificationPayload.type, 'booking-confirmation');
});

test('booking cancelBooking releases seats and notifies stakeholders', async () => {
  const booking = createBookingDoc({ status: 'confirmed' });
  let releasedArgs;
  let notificationPayloads;
  const Booking = { findById: async () => booking };
  const eventService = {
    releaseSeats: async (eventId, seats) => {
      releasedArgs = { eventId, seats };
      return {};
    }
  };
  const notificationService = {
    createNotifications: async (payloads) => {
      notificationPayloads = payloads;
      return payloads;
    }
  };
  const authService = { listAdmins: async () => [{ id: 'admin-1' }] };
  const { cancelBooking } = createController({ Booking, eventService, notificationService, authService });
  const res = createRes();

  await cancelBooking({ params: { id: 'booking-1' }, user: { id: 'user-1', role: 'customer' }, token: 'token' }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(booking.status, 'cancelled');
  assert.deepEqual(releasedArgs, { eventId: 'event-1', seats: 2 });
  assert.equal(notificationPayloads.length, 3);
});
