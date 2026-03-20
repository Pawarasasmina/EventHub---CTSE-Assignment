const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub Auth Service API',
      version: '1.0.0',
      description: 'Authentication microservice for EventHub'
    },
    servers: [{ url: 'http://localhost:5001' }],
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
      '/api/auth/register': { post: { summary: 'Register user', requestBody: { required: true }, responses: { 201: { description: 'Registered' } } } },
      '/api/auth/login': { post: { summary: 'Login user', requestBody: { required: true }, responses: { 200: { description: 'Logged in' } } } },
      '/api/auth/me': { get: { summary: 'Current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Current user' } } } },
      '/api/auth/users/{id}': { get: { summary: 'Get user by id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'User details' } } } }
    }
  },
  apis: []
});
