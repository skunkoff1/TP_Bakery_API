// LIBRAIRIES
const express = require('express');
const app = express();
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require('./swagger.json');

// ROUTES
const prediction_routes = require("./routes/predictionRoute");
const stats_routes = require("./routes/statsRoutes")

app.use(cors()); //Utilisation de Cors
app.use(express.json()); //Utilisation du parser JSON d'Express

// Utilisation des routes
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/", prediction_routes);
app.use("/", stats_routes);


// MISE SUR ECOUTE DU PORT
app.listen(777, () => {
    console.log("le serveur est lancé sur le port 777")
})