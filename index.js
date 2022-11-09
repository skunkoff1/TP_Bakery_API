const express = require('express');
const app = express();
const cors = require("cors");
const bakery_routes = require("./routes/bakery.js");

app.use(cors()); //Utilisation de Cors
app.use(express.json()); //Utilisation d'Express
app.use("/", bakery_routes);



app.listen(777, () => {
    console.log("le serveur est lancé sur le port 777")
})