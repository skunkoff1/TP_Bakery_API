const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/predictionRoutes.js', './routes/statsRoutes.js'];

const doc = {
    info: {
        version: "1.0.0",
        title: "Documentation de l'API Bakery",
        description: "Une API conçue pour faire des statistiques, et des predictions de ventes pour une chaîne de boulangerie coréenne"
    },
    host: "api.bakery.dd-web.fr",
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],    
};

swaggerAutogen(outputFile, endpointsFiles, doc);