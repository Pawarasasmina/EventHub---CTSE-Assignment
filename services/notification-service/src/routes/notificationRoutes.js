const express = require('express');
const { body, param } = require('express-validator');
const {
  sendNotification,
  getNotificationsByUser,
  getNotificationById
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);

router.post('/send', [body('userId').isString().notEmpty().withMessage('User id is required'), body('type').trim().notEmpty().withMessage('Type is required'), body('title').trim().notEmpty().withMessage('Title is required'), body('message').trim().notEmpty().withMessage('Message is required'), body('channel').optional().isString(), body('relatedBookingId').optional().isString()], validate, asyncHandler(sendNotification));
router.get('/user/:userId', [param('userId').isString().notEmpty().withMessage('User id is required')], validate, asyncHandler(getNotificationsByUser));
router.get('/:id', [param('id').isMongoId().withMessage('Valid notification id is required')], validate, asyncHandler(getNotificationById));

module.exports = router;
