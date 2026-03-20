const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reserveSeats,
  releaseSeats
} = require('../controllers/eventController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const eventBodyRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('ticketPrice').isFloat({ min: 0 }).withMessage('Ticket price must be 0 or greater'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean')
];

router.get('/', [query('published').optional().isBoolean()], validate, asyncHandler(getEvents));
router.get('/:id', [param('id').isMongoId().withMessage('Valid event id is required')], validate, asyncHandler(getEventById));
router.post('/', auth, authorize('organizer', 'admin'), eventBodyRules, validate, asyncHandler(createEvent));
router.put('/:id', auth, authorize('organizer', 'admin'), [param('id').isMongoId().withMessage('Valid event id is required'), ...eventBodyRules], validate, asyncHandler(updateEvent));
router.delete('/:id', auth, authorize('organizer', 'admin'), [param('id').isMongoId().withMessage('Valid event id is required')], validate, asyncHandler(deleteEvent));
router.patch('/:id/reserve-seats', auth, authorize('organizer', 'admin', 'customer'), [param('id').isMongoId().withMessage('Valid event id is required'), body('seats').isInt({ min: 1 }).withMessage('Seats must be at least 1')], validate, asyncHandler(reserveSeats));
router.patch('/:id/release-seats', auth, authorize('organizer', 'admin', 'customer'), [param('id').isMongoId().withMessage('Valid event id is required'), body('seats').isInt({ min: 1 }).withMessage('Seats must be at least 1')], validate, asyncHandler(releaseSeats));

module.exports = router;
