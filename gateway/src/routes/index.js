const express = require('express');
const { buildProxy } = require('./proxyFactory');
const { buildServiceConfig } = require('../config/services');

const router = express.Router();
const services = buildServiceConfig();

router.use('/auth', buildProxy(services.auth, '/api/auth'));
router.use('/events', buildProxy(services.event, '/api/events'));
router.use('/bookings', buildProxy(services.booking, '/api/bookings'));
router.use('/notifications', buildProxy(services.notification, '/api/notifications'));

module.exports = router;
