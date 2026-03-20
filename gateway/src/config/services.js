const buildServiceConfig = () => ({
  auth: process.env.AUTH_SERVICE_URL,
  event: process.env.EVENT_SERVICE_URL,
  booking: process.env.BOOKING_SERVICE_URL,
  notification: process.env.NOTIFICATION_SERVICE_URL
});

module.exports = { buildServiceConfig };
