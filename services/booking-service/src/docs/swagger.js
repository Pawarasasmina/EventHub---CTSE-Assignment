const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub Booking Service API',
      version: '1.0.0',
      description: 'Booking microservice for EventHub'
    },
    servers: [{ url: 'http://localhost:5003' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    paths: {
      '/': { get: { summary: 'Health check', responses: { 200: { description: 'Service alive' } } } },
      '/api/bookings': { post: { summary: 'Create booking request', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Booking request created' } } } },
      '/api/bookings/organizer/queue': { get: { summary: 'List pending booking approvals for organizer or admin', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Approval queue' } } } },
      '/api/bookings/user/{userId}': { get: { summary: 'List bookings by user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Bookings list' } } } },
      '/api/bookings/{id}': { get: { summary: 'Get booking by id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Booking detail' } } } },
      '/api/bookings/{id}/confirm': { patch: { summary: 'Confirm pending booking', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Booking confirmed' } } } },
      '/api/bookings/{id}/reject': { patch: { summary: 'Reject pending booking', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Booking rejected' } } } },
      '/api/bookings/{id}/cancel': { patch: { summary: 'Cancel booking', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Booking cancelled' } } } }
    }
  },
  apis: []
});
