//Chargement de la Lib Express (serveur)
const express = require("express");
//Dans router on stocke l'objet express.Router(), pour éviter de faire la commande en full genre express.Router, on utilisera router.get ou router.post
const router = express.Router();

const {
    getStats,
    getTotalSales,
} = require("../controllers/statsController");

router.post("/stats", getStats);
router.post("/getTotal", getTotalSales);

module.exports = router;