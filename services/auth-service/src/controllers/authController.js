const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role });

  return sendSuccess(res, 201, 'User registered successfully', {
    token: signToken(user),
    user: sanitizeUser(user)
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  return sendSuccess(res, 200, 'Login successful', {
    token: signToken(user),
    user: sanitizeUser(user)
  });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return sendSuccess(res, 200, 'Current user retrieved', sanitizeUser(user));
};

const listUsers = async (req, res) => {
  if (!req.internalService && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const role = req.query.role;
  const users = role ? await User.findByRole(role) : await User.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Users retrieved', users.map(sanitizeUser));
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return sendSuccess(res, 200, 'User retrieved', sanitizeUser(user));
};

module.exports = {
  register,
  login,
  getCurrentUser,
  listUsers,
  getUserById
};
