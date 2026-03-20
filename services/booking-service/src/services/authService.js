const { createServiceClient } = require('./httpClient');

const listUsers = async (params, token) => {
  const client = createServiceClient(process.env.AUTH_SERVICE_URL, token);
  const response = await client.get('/api/auth/users', { params });
  return response.data.data;
};

const listAdmins = async (token) => listUsers({ role: 'admin' }, token);

module.exports = {
  listAdmins
};
