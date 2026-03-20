const axios = require('axios');

const createServiceClient = (baseURL, token) =>
  axios.create({
    baseURL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

module.exports = { createServiceClient };
