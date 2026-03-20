const { createServiceClient } = require('./httpClient');

const createNotification = async (payload, token) => {
  const client = createServiceClient(process.env.NOTIFICATION_SERVICE_URL, token);
  const response = await client.post('/api/notifications/send', payload);
  return response.data.data;
};

module.exports = { createNotification };
