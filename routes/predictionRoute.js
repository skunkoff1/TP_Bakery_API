//Chargement de la Lib Express (serveur)
const express = require("express");
//Dans router on stocke l'objet express.Router(), pour éviter de faire la commande en full genre express.Router, on utilisera router.get ou router.post
const router = express.Router();

const {
    getMonthPrediction,
    getDayPrediction,
    useTensor,
} = require("../controllers/predictionController.js");

router.post("/monthPrediction", getMonthPrediction);
router.post("/dayPrediction", getDayPrediction);
router.get("/tensor", useTensor);

module.exports = router;