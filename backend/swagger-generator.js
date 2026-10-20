const fs = require('fs');
const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'E-Community API',
        description: 'API documentation for E-Community',
        version: '1.0.0'
    },
    host: process.env.SWAGGER_HOST || 'localhost:5000',
    schemes: ['http'],
    tags: [
        { name: 'Users', description: 'User profile, auth, and follow APIs' },
        { name: 'Messages', description: 'Direct message APIs' },
        { name: 'Posts', description: 'Post feed and interaction APIs' },
        { name: 'Comments', description: 'Comment APIs' },
        { name: 'Search', description: 'Search APIs' },
        { name: 'WebRTC', description: 'Call and RTC helper APIs' },
        { name: 'Uploads', description: 'Upload and media APIs' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
    './app.js',
    './routes/userRoutes.js',
    './routes/messageRoutes.js',
    './routes/postRoutes.js',
    './routes/commentRoutes.js',
    './routes/searchRoutes.js',
    './routes/webrtcRoutes.js',
    './routes/uploadRoutes.js'
];

const routeTagRules = [
    { prefix: '/api/users', tag: 'Users' },
    { prefix: '/api/messages', tag: 'Messages' },
    { prefix: '/api/posts', tag: 'Posts' },
    { prefix: '/api/comments', tag: 'Comments' },
    { prefix: '/api/search', tag: 'Search' },
    { prefix: '/api/webrtc', tag: 'WebRTC' },
    { prefix: '/api/uploads', tag: 'Uploads' },
];

const resolveTag = (routePath) => {
    const rule = routeTagRules.find(({ prefix }) => routePath.startsWith(prefix));
    return rule ? rule.tag : 'Misc';
};

const postProcessSwaggerFile = () => {
    const raw = fs.readFileSync(outputFile, 'utf8');
    const spec = JSON.parse(raw);

    const filteredPaths = Object.entries(spec.paths || {}).filter(([routePath]) => routePath.startsWith('/api/'));

    spec.paths = filteredPaths.reduce((accumulator, [routePath, operations]) => {
        const tag = resolveTag(routePath);
        const taggedOperations = Object.fromEntries(
            Object.entries(operations).map(([method, operation]) => [
                method,
                {
                    ...operation,
                    tags: operation.tags && operation.tags.length > 0 ? operation.tags : [tag],
                },
            ])
        );

        accumulator[routePath] = taggedOperations;
        return accumulator;
    }, {});

    fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
};

swaggerAutogen(outputFile, endpointsFiles, doc)
    .then(() => {
        postProcessSwaggerFile();
        console.log('Swagger file generated and grouped by model tags at swagger-output.json');
    })
    .catch((error) => {
        console.error('Swagger generation failed:', error);
        process.exitCode = 1;
    });