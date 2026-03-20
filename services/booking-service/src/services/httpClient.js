const axios = require('axios');

const INTERNAL_SERVICE_NAME = process.env.INTERNAL_SERVICE_NAME || 'booking-service';
const INTERNAL_SERVICE_SECRET = process.env.SERVICE_TO_SERVICE_SECRET || 'eventhub-internal-secret';

const createServiceClient = (baseURL, token) =>
  axios.create({
    baseURL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-internal-service-name': INTERNAL_SERVICE_NAME,
      'x-internal-service-secret': INTERNAL_SERVICE_SECRET
    }
  });

module.exports = { createServiceClient };
