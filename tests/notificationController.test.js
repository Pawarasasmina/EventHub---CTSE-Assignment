const test = require('node:test');
const path = require('node:path');
const { assert, createRes, loadWithMocks } = require('./helpers');

const controllerPath = path.resolve(__dirname, '../services/notification-service/src/controllers/notificationController.js');
const notificationPath = require.resolve('../services/notification-service/src/models/Notification');

test('notification send blocks unauthorized callers', async () => {
  const Notification = { create: async () => ({}) };
  const { sendNotification } = loadWithMocks(controllerPath, new Map([[notificationPath, Notification]]));
  const res = createRes();

  await sendNotification({ internalService: false, user: { role: 'customer', id: 'u1' }, body: { userId: 'u2' } }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Access denied');
});

test('notification send stores notification for internal caller', async () => {
  const created = { _id: 'n1', userId: 'u2', title: 'Booked', status: 'sent' };
  const Notification = { create: async (payload) => ({ ...created, ...payload }) };
  const { sendNotification } = loadWithMocks(controllerPath, new Map([[notificationPath, Notification]]));
  const res = createRes();

  await sendNotification({ internalService: true, user: { role: 'admin', id: 'admin-1' }, body: { userId: 'u2', type: 'booking', title: 'Booked', message: 'done' } }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'sent');
});

test('notification mark as read returns 404 when not found', async () => {
  const Notification = { findById: async () => null };
  const { markNotificationAsRead } = loadWithMocks(controllerPath, new Map([[notificationPath, Notification]]));
  const res = createRes();

  await markNotificationAsRead({ params: { id: 'missing' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, 'Notification not found');
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
  const { markNotificationAsRead } = loadWithMocks(controllerPath, new Map([[notificationPath, Notification]]));
  const res = createRes();

  await markNotificationAsRead({ params: { id: 'n2' }, user: { role: 'customer', id: 'u1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(notification.isRead, true);
  assert.ok(notification.readAt);
});
