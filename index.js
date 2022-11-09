// LIBRAIRIES
const express = require('express');
const app = express();
const cors = require("cors");

// ROUTES
const prediction_routes = require("./routes/predictionRoute");
const stats_routes = require("./routes/statsRoutes")

app.use(cors()); //Utilisation de Cors
app.use(express.json()); //Utilisation du parser JSON d'Express

// Utilisation des routes
app.use("/", prediction_routes);
app.use("/", stats_routes);


// MISE SUR ECOUTE DU PORT
app.listen(777, () => {
    console.log("le serveur est lancé sur le port 777")
})