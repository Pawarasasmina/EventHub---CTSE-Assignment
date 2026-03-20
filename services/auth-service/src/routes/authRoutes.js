const express = require('express');
const { body, param } = require('express-validator');
const {
  register,
  login,
  getCurrentUser,
  getUserById
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'organizer', 'admin']).withMessage('Invalid role')
  ],
  validate,
  asyncHandler(register)
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  asyncHandler(login)
);

router.get('/me', auth, asyncHandler(getCurrentUser));

router.get(
  '/users/:id',
  auth,
  [param('id').isMongoId().withMessage('Valid user id is required')],
  validate,
  asyncHandler(getUserById)
);

module.exports = router;
