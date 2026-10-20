const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerFile = path.join(__dirname, 'swagger-output.json');

const fallbackSpecs = {
    openapi: '3.0.0',
    info: {
        title: 'E-Community API',
        version: '1.0.0',
        description: 'API documentation for E-Community'
    },
    servers: [
        {
            url: process.env.PRODUCTION_URL || 'http://localhost:5000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {}
};

const specs = fs.existsSync(swaggerFile) ? require(swaggerFile) : fallbackSpecs;

module.exports = { swaggerUi, specs };