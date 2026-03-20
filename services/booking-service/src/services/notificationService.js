const { createServiceClient } = require('./httpClient');

const createNotification = async (payload, token) => {
  const client = createServiceClient(process.env.NOTIFICATION_SERVICE_URL, token);
  const response = await client.post('/api/notifications/send', payload);
  return response.data.data;
};

const createNotifications = async (payloads, token) => Promise.all(payloads.map((payload) => createNotification(payload, token)));

module.exports = {
  createNotification,
  createNotifications
};
