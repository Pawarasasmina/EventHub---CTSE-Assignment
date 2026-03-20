const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub Event Service API',
      version: '1.0.0',
      description: 'Event management microservice for EventHub'
    },
    servers: [{ url: 'http://localhost:5002' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/': { get: { summary: 'Health check', responses: { 200: { description: 'Service alive' } } } },
      '/api/events': {
        get: { summary: 'List events', responses: { 200: { description: 'Events list' } } },
        post: { summary: 'Create event', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } }
      },
      '/api/events/{id}': {
        get: { summary: 'Get event', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Event detail' } } },
        put: { summary: 'Update event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { summary: 'Delete event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } }
      },
      '/api/events/{id}/reserve-seats': {
        patch: { summary: 'Reserve seats', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Reserved' } } }
      },
      '/api/events/{id}/release-seats': {
        patch: { summary: 'Release seats', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Released' } } }
      }
    }
  },
  apis: []
});
