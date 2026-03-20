const test = require('node:test');
const path = require('node:path');
const { assert, createRes, loadWithMocks } = require('./helpers');

const controllerPath = path.resolve(__dirname, '../services/notification-service/src/controllers/notificationController.js');
const notificationPath = require.resolve('../services/notification-service/src/models/Notification');

const createController = (Notification) => loadWithMocks(controllerPath, new Map([[notificationPath, Notification]]));

test('notification send blocks unauthorized callers', async () => {
  const Notification = { create: async () => ({}) };
  const { sendNotification } = createController(Notification);
  const res = createRes();

  await sendNotification({ internalService: false, user: { role: 'customer', id: 'u1' }, body: { userId: 'u2' } }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Access denied');
});

test('notification send stores notification for internal caller', async () => {
  const created = { _id: 'n1', userId: 'u2', title: 'Booked', status: 'sent' };
  const Notification = { create: async (payload) => ({ ...created, ...payload }) };
  const { sendNotification } = createController(Notification);
  const res = createRes();

  await sendNotification({ internalService: true, user: { role: 'admin', id: 'admin-1' }, body: { userId: 'u2', type: 'booking', title: 'Booked', message: 'done' } }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.status, 'sent');
});

test('notification getNotificationsByUser blocks unauthorized users', async () => {
  const Notification = { find: () => ({ sort: async () => [] }) };
  const { getNotificationsByUser } = createController(Notification);
  const res = createRes();

  await getNotificationsByUser({ params: { userId: 'u2' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 403);
});

test('notification getNotificationsByUser returns notifications for owner', async () => {
  const notifications = [{ _id: 'n1', userId: 'u1' }];
  const Notification = { find: () => ({ sort: async () => notifications }) };
  const { getNotificationsByUser } = createController(Notification);
  const res = createRes();

  await getNotificationsByUser({ params: { userId: 'u1' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.length, 1);
});

test('notification getNotificationById blocks unauthorized access', async () => {
  const Notification = { findById: async () => ({ _id: 'n1', userId: 'u2' }) };
  const { getNotificationById } = createController(Notification);
  const res = createRes();

  await getNotificationById({ params: { id: 'n1' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 403);
});

test('notification getNotificationById returns notification for owner', async () => {
  const Notification = { findById: async () => ({ _id: 'n1', userId: 'u1' }) };
  const { getNotificationById } = createController(Notification);
  const res = createRes();

  await getNotificationById({ params: { id: 'n1' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 200);
});

test('notification mark as read returns 404 when not found', async () => {
  const Notification = { findById: async () => null };
  const { markNotificationAsRead } = createController(Notification);
  const res = createRes();

  await markNotificationAsRead({ params: { id: 'missing' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 404);
});

test('notification mark as read updates readable notification', async () => {
  const notification = {
    _id: 'n2',
    userId: 'u1',
    isRead: false,
    readAt: null,
    save: async function save() { return this; }
  };
  const Notification = { findById: async () => notification };
  const { markNotificationAsRead } = createController(Notification);
  const res = createRes();

  await markNotificationAsRead({ params: { id: 'n2' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(notification.isRead, true);
  assert.ok(notification.readAt);
});
