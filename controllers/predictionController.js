const fs = require('fs');
const brain = require("brain.js");

/*==================================================================================*/
/*============================= PREDICTION AU MOIS =================================*/
/*==================================================================================*/

const getMonthPrediction = async(req, res) => {

    // Récupération des parametres de la requête
    let month = req.body.month;
    let product = req.body.product;
    let place = req.body.place;

    let sum = 0;
    let mean = 0;
    let nbOfMonth = 0;
    let currentYear = "";
    let trainingData = [];

    let data = readFile();

    // POUR TOUS LES PRODUITS
    if(product != "tous") {
        for (const elmt of data) {
            let m = elmt.datetime.substring(5, 7);
            let y = elmt.datetime.substring(0, 4);
            if (elmt.place == place && m == month) {    
                if (nbOfMonth == 0) {
                    currentYear = y;
                    nbOfMonth += 1;
                } else if (currentYear != y) {
                    currentYear = y;
                    nbOfMonth += 1;
                }
                for (const key of Object.keys(elmt)) {
                    if (key == product) {
    
                        if (elmt[key] != "") {
                            sum += parseInt(elmt[key]);
                        }
                    }
                }
            }    
            mean = sum / nbOfMonth;
        }    
        trainingData.push([1, sum])
    
        const result = await calculatePrediction(trainingData);
    
        return res.status(200).json({ "mean": mean, "nbOfMonth": nbOfMonth, "result": result });
    }
    else {
        // POUR UN PRODUIT DONNEE
        for (const elmt of data) {
            let m = elmt.datetime.substring(5, 7);
            let y = elmt.datetime.substring(0, 4);
            if (elmt.place == place && m == month) {  
                sum = 0;  
                if (nbOfMonth == 0) {
                    currentYear = y;
                    nbOfMonth += 1;
                } else if (currentYear != y) {
                    currentYear = y;
                    nbOfMonth += 1;
                }
                for (const key of Object.keys(elmt)) {
                    if (elmt[key] != "" && key != "datetime" && key != "day_of_week" && key != "total" && key != "place") {
                            sum += parseInt(elmt[key]);
                    }
                }  
                console.log(sum);
                trainingData.push([1, sum])  
            }
        }            
    
        const result = await calculateDayPrediction(trainingData);
    
        return res.status(200).json({ "mean": mean, "nbOfMonth": nbOfMonth, "result": result });
    }

}

/*==================================================================================*/
/*============================= PREDICTION AU JOUR =================================*/
/*==================================================================================*/

const getDayPrediction = async(req, res) => {

    // Récupération des parametres de la requête
    let day = req.body.day;
    let product = req.body.product;
    let place = req.body.place;

    let sum = 0;
    let mean = 0;
    let nbOfDay = 0;
    let trainingData = [];
    
    let data = readFile();

    // POUR TOUS LES PRODUITS
    if(product != "tous") {
    
        for (const elmt of data) {
            if (elmt.place == place && elmt.day_of_week == day) {
                nbOfDay+=1;
                for (const key of Object.keys(elmt)) {
                    if (key == product) {
                        if (elmt[key] != "") {
                            sum += parseInt(elmt[key]);
                            trainingData.push([1, elmt[key]])
                        }
                    }
                }
            }    
            mean = sum / nbOfDay;
        } 
    
        const result = await calculateDayPrediction(trainingData);
    
        return res.status(200).json({ "mean": mean, "nbOfDay": nbOfDay, "result": result });
    }
    else {
        // POUR UN PRODUIT DONNEE
        for (const elmt of data) {
            if (elmt.place == place && elmt.day_of_week == day) {
                nbOfDay += 1;
                sum = 0;
                for (const key of Object.keys(elmt)) {                    
                    if (elmt[key] != "" && key != "datetime" && key != "day_of_week" && key != "total" && key != "place") {
                        sum += parseInt(elmt[key]);
                    }
                }
                trainingData.push([1, sum])
            }    
        } 
    }
    const result = await calculateDayPrediction(trainingData);
    
    return res.status(200).json({ "mean": mean, "nbOfDay": nbOfDay, "result": result });

}


// FONCTION QUI APPELLE L'ENTRAINEMENT DE L'IA AVEC ITERATION MAX
async function calculatePrediction(data) {
    const net = new brain.recurrent.LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [20, 5, 1],
        outputSize: 1
    });

    net.train(data, { log: true })

    const result = await net.run([1])

    return result
}

// FONCTION QUI APPELLE L'ENTRAINEMENT DE L'IA AVEC ITERATION MIN
async function calculateDayPrediction(data) {
    const net = new brain.recurrent.LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [20, 5, 1],
        outputSize: 1
    });

    net.train(data, { 
        log: true,
        iterations: 800, 
    })

    const result = await net.run([1])

    return result
}

// FONCTION POUR LA PAGE UTILISANT TENSORFLOW
const useTensor = (req, res) => {

    let data = readFile();

    let dataMag1 = [];

    for(const elmt of data) {
        if(elmt.place == "mag1") {
            dataMag1.push(elmt)
        }
    }

    let dataCleaned = dataMag1.map(elmt => ({
        day: new Date(elmt.datetime).getDay(),
        angbutter: elmt.angbutter,
    }))

    for(const elmt of dataCleaned) { 
        if(elmt.angbutter == "") {
            elmt.angbutter = 0;
        }
        else {
            elmt.angbutter = parseInt(elmt.angbutter)
        }
    }      
    
    return res.status(200).json({"data": dataCleaned})
    
}

// FONCTION QUI PARSE LES DONNEES
function readFile() {
    let data;
    try {
        data = JSON.parse(fs.readFileSync('./Bakery.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }
    return data;
}

module.exports = { getMonthPrediction, getDayPrediction, useTensor };