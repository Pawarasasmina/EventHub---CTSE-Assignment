const test = require('node:test');
const path = require('node:path');
const { assert, createRes, loadWithMocks } = require('./helpers');

const controllerPath = path.resolve(__dirname, '../services/auth-service/src/controllers/authController.js');
const userPath = require.resolve('../services/auth-service/src/models/User');
const jwtMock = { sign: () => 'mock-jwt-token' };

const createUserDoc = (overrides = {}) => ({
  _id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  comparePassword: async () => true,
  ...overrides
});

const createController = (User) => loadWithMocks(controllerPath, new Map([
  [userPath, User],
  ['jsonwebtoken', jwtMock]
]));

test('auth register returns 409 when user already exists', async () => {
  const User = { findOne: async () => createUserDoc() };
  const { register } = createController(User);
  const res = createRes();

  await register({ body: { email: 'test@example.com' } }, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, 'User already exists');
});

test('auth register returns token and sanitized user on success', async () => {
  const createdUser = createUserDoc({ name: 'Alice', role: 'organizer' });
  const User = {
    findOne: async () => null,
    create: async () => createdUser
  };
  const { register } = createController(User);
  const res = createRes();

  await register({ body: { name: 'Alice', email: 'test@example.com', password: 'secret123', role: 'organizer' } }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.name, 'Alice');
  assert.equal(res.body.data.user.role, 'organizer');
  assert.equal(res.body.data.token, 'mock-jwt-token');
});

test('auth login rejects invalid credentials', async () => {
  const User = { findOne: async () => null };
  const { login } = createController(User);
  const res = createRes();

  await login({ body: { email: 'bad@example.com', password: 'wrong' } }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Invalid credentials');
});

test('auth login returns token on success', async () => {
  const User = { findOne: async () => createUserDoc() };
  const { login } = createController(User);
  const res = createRes();

  await login({ body: { email: 'test@example.com', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.token, 'mock-jwt-token');
});

test('auth getCurrentUser returns 404 when user does not exist', async () => {
  const User = { findById: async () => null };
  const { getCurrentUser } = createController(User);
  const res = createRes();

  await getCurrentUser({ user: { id: 'missing' } }, res);

  assert.equal(res.statusCode, 404);
});

test('auth getCurrentUser returns sanitized user', async () => {
  const User = { findById: async () => createUserDoc({ _id: 'u1', name: 'Current User' }) };
  const { getCurrentUser } = createController(User);
  const res = createRes();

  await getCurrentUser({ user: { id: 'u1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.name, 'Current User');
});

test('auth listUsers blocks non-admin external callers', async () => {
  const User = {
    find: async () => [],
    findByRole: async () => []
  };
  const { listUsers } = createController(User);
  const res = createRes();

  await listUsers({ internalService: false, user: { role: 'customer' }, query: {} }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Access denied');
});

test('auth listUsers returns filtered users for internal service access', async () => {
  const users = [createUserDoc({ _id: 'admin-1', role: 'admin', name: 'Admin User' })];
  const User = {
    find: async () => users,
    findByRole: async () => users
  };
  const { listUsers } = createController(User);
  const res = createRes();

  await listUsers({ internalService: true, query: { role: 'admin' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].role, 'admin');
});

test('auth getUserById returns sanitized user', async () => {
  const User = { findById: async () => createUserDoc({ _id: 'user-99', name: 'Lookup User' }) };
  const { getUserById } = createController(User);
  const res = createRes();

  await getUserById({ params: { id: 'user-99' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.name, 'Lookup User');
});
