const test = require('node:test');
const path = require('node:path');
const { assert, loadWithMocks } = require('./helpers');

const httpClientPath = path.resolve(__dirname, '../services/booking-service/src/services/httpClient.js');
const authServicePath = path.resolve(__dirname, '../services/booking-service/src/services/authService.js');
const notificationServicePath = path.resolve(__dirname, '../services/booking-service/src/services/notificationService.js');
const httpClientResolved = require.resolve('../services/booking-service/src/services/httpClient');

const loadHttpClient = (axiosMock) => loadWithMocks(httpClientPath, new Map([['axios', axiosMock]]));

test('httpClient creates service client with auth and internal headers', async () => {
  process.env.INTERNAL_SERVICE_NAME = 'booking-service';
  process.env.SERVICE_TO_SERVICE_SECRET = 'eventhub-internal-secret';

  let receivedConfig;
  const axiosMock = {
    create: (config) => {
      receivedConfig = config;
      return { marker: 'client' };
    }
  };

  const { createServiceClient } = loadHttpClient(axiosMock);
  const client = createServiceClient('https://example.internal', 'jwt-token');

  assert.equal(client.marker, 'client');
  assert.equal(receivedConfig.baseURL, 'https://example.internal');
  assert.equal(receivedConfig.headers.Authorization, 'Bearer jwt-token');
  assert.equal(receivedConfig.headers['x-internal-service-name'], 'booking-service');
  assert.equal(receivedConfig.headers['x-internal-service-secret'], 'eventhub-internal-secret');
});

test('httpClient creates service client without auth token', async () => {
  delete process.env.INTERNAL_SERVICE_NAME;
  delete process.env.SERVICE_TO_SERVICE_SECRET;

  let receivedConfig;
  const axiosMock = {
    create: (config) => {
      receivedConfig = config;
      return config;
    }
  };

  const { createServiceClient } = loadHttpClient(axiosMock);
  createServiceClient('https://example.internal');

  assert.equal(receivedConfig.baseURL, 'https://example.internal');
  assert.equal(receivedConfig.headers.Authorization, undefined);
  assert.equal(receivedConfig.headers['x-internal-service-name'], 'booking-service');
  assert.equal(receivedConfig.headers['x-internal-service-secret'], 'eventhub-internal-secret');
});

test('authService listAdmins requests admin users through auth-service client', async () => {
  process.env.AUTH_SERVICE_URL = 'https://auth.internal';

  let receivedBaseUrl;
  let receivedToken;
  let receivedParams;
  const httpClientMock = {
    createServiceClient: (baseURL, token) => {
      receivedBaseUrl = baseURL;
      receivedToken = token;
      return {
        get: async (url, config) => {
          receivedParams = { url, config };
          return { data: { data: [{ id: 'admin-1' }, { id: 'admin-2' }] } };
        }
      };
    }
  };

  const { listAdmins } = loadWithMocks(authServicePath, new Map([[httpClientResolved, httpClientMock]]));
  const admins = await listAdmins('service-token');

  assert.equal(receivedBaseUrl, 'https://auth.internal');
  assert.equal(receivedToken, 'service-token');
  assert.equal(receivedParams.url, '/api/auth/users');
  assert.deepEqual(receivedParams.config.params, { role: 'admin' });
  assert.equal(admins.length, 2);
});

test('notificationService createNotification posts to notification endpoint', async () => {
  process.env.NOTIFICATION_SERVICE_URL = 'https://notification.internal';

  let receivedBaseUrl;
  let receivedToken;
  let receivedPost;
  const httpClientMock = {
    createServiceClient: (baseURL, token) => {
      receivedBaseUrl = baseURL;
      receivedToken = token;
      return {
        post: async (url, payload) => {
          receivedPost = { url, payload };
          return { data: { data: { id: 'notification-1', ...payload } } };
        }
      };
    }
  };

  const { createNotification } = loadWithMocks(notificationServicePath, new Map([[httpClientResolved, httpClientMock]]));
  const payload = { userId: 'user-1', title: 'Booked', message: 'done' };
  const result = await createNotification(payload, 'notify-token');

  assert.equal(receivedBaseUrl, 'https://notification.internal');
  assert.equal(receivedToken, 'notify-token');
  assert.equal(receivedPost.url, '/api/notifications/send');
  assert.deepEqual(receivedPost.payload, payload);
  assert.equal(result.id, 'notification-1');
});

test('notificationService createNotifications sends all payloads', async () => {
  const calls = [];
  const httpClientMock = {
    createServiceClient: () => ({
      post: async (url, payload) => {
        calls.push({ url, payload });
        return { data: { data: payload } };
      }
    })
  };

  const { createNotifications } = loadWithMocks(notificationServicePath, new Map([[httpClientResolved, httpClientMock]]));
  const payloads = [
    { userId: 'user-1', title: 'One' },
    { userId: 'user-2', title: 'Two' }
  ];

  const result = await createNotifications(payloads, 'notify-token');

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, '/api/notifications/send');
  assert.equal(calls[1].url, '/api/notifications/send');
  assert.deepEqual(result, payloads);
});
