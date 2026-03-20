const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub Notification Service API',
      version: '1.0.0',
      description: 'Notification microservice for EventHub'
    },
    servers: [{ url: 'http://localhost:5004' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    paths: {
      '/': { get: { summary: 'Health check', responses: { 200: { description: 'Service alive' } } } },
      '/api/notifications/send': { post: { summary: 'Send notification', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Notification sent' } } } },
      '/api/notifications/user/{userId}': { get: { summary: 'List notifications by user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Notifications list' } } } },
      '/api/notifications/{id}': { get: { summary: 'Get notification by id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Notification detail' } } } },
      '/api/notifications/{id}/read': { patch: { summary: 'Mark notification as read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Notification marked as read' } } } }
    }
  },
  apis: []
});
