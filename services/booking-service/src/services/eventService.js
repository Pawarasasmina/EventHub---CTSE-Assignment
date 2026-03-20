const { createServiceClient } = require('./httpClient');

const getEvent = async (eventId, token) => {
  const client = createServiceClient(process.env.EVENT_SERVICE_URL, token);
  const response = await client.get(`/api/events/${eventId}`);
  return response.data.data;
};

const reserveSeats = async (eventId, seats, token) => {
  const client = createServiceClient(process.env.EVENT_SERVICE_URL, token);
  const response = await client.patch(`/api/events/${eventId}/reserve-seats`, { seats });
  return response.data.data;
};

const releaseSeats = async (eventId, seats, token) => {
  const client = createServiceClient(process.env.EVENT_SERVICE_URL, token);
  const response = await client.patch(`/api/events/${eventId}/release-seats`, { seats });
  return response.data.data;
};

module.exports = {
  getEvent,
  reserveSeats,
  releaseSeats
};
