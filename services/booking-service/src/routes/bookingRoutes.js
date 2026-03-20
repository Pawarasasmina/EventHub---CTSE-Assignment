const express = require('express');
const { body, param } = require('express-validator');
const {
  createBooking,
  getBookingsByUser,
  getBookingById,
  getApprovalQueue,
  confirmBooking,
  rejectBooking,
  cancelBooking
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const canReadUserBookings = require('../middleware/canReadUserBookings');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(auth);

router.post('/', [body('eventId').isMongoId().withMessage('Valid event id is required'), body('ticketCount').isInt({ min: 1 }).withMessage('Ticket count must be at least 1')], validate, asyncHandler(createBooking));
router.get('/organizer/queue', asyncHandler(getApprovalQueue));
router.get('/user/:userId', [param('userId').isString().notEmpty().withMessage('Valid user id is required')], validate, canReadUserBookings, asyncHandler(getBookingsByUser));
router.get('/:id', [param('id').isMongoId().withMessage('Valid booking id is required')], validate, asyncHandler(getBookingById));
router.patch('/:id/confirm', [param('id').isMongoId().withMessage('Valid booking id is required')], validate, asyncHandler(confirmBooking));
router.patch('/:id/reject', [param('id').isMongoId().withMessage('Valid booking id is required')], validate, asyncHandler(rejectBooking));
router.patch('/:id/cancel', [param('id').isMongoId().withMessage('Valid booking id is required')], validate, asyncHandler(cancelBooking));

module.exports = router;
