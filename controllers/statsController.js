const fs = require('fs');
const brain = require("brain.js");

/*==================================================================================*/
/*================================ STATISTIQUES ====================================*/
/*==================================================================================*/

const getStats = (req, res) => {

    // Récupération des parametres de la requête
    let day = req.body.day;
    let year = req.body.year;
    let product = req.body.product;
    let place = req.body.place;

    let sum = 0;
    let mean = 0;
    let nbOfDay = 0;
    let dayMax = "";
    let max = 0;
    let dataNumber = [];
    let dataDate = [];
    let total = 0;

    let data = readFile();

    // POUR TOUS LES PRODUITS
    if(product != "tous") {
        for (const elmt of data) {
            sum = 0;
            let y = elmt.datetime.substring(0, 4);
    
            // POUR TOUTES LES ANNEES
            if (year == "all") {
                if (elmt.day_of_week == day && elmt.place == place) {
                    for (const key of Object.keys(elmt)) {
                        if (key == product) {
                            nbOfDay += 1;
                            dataNumber.push(elmt[key]);
                            dataDate.push(elmt.datetime);
                            if (elmt[key] != "") {
                                sum += parseInt(elmt[key]);
                                if (parseInt(elmt[key]) > max) {
                                    max = parseInt(elmt[key]);
                                    dayMax = elmt.datetime;
                                }
                            }
                        }
                    }
                }
            } else {
                // POUR UNE ANNEE DONNEE
                if (elmt.day_of_week == day && elmt.place == place && y == year) {
                    for (const key of Object.keys(elmt)) {
                        if (key == product) {
                            nbOfDay += 1;
                            dataNumber.push(elmt[key]);
                            dataDate.push(elmt.datetime);
                            if (elmt[key] != "") {
                                sum += parseInt(elmt[key]);
                                if (parseInt(elmt[key]) > max) {
                                    max = parseInt(elmt[key]);
                                    dayMax = elmt.datetime;
                                }
                            }
                        }
                    }
                }
            }
            total += sum;
        }
        mean = total / nbOfDay;

        return res.status(200).json({ "mean": mean, "nbOfDay": nbOfDay, "dayMax": dayMax, "max": max, "number": dataNumber, "date": dataDate });
    }
    else {
        // POUR UN PRODUIT DONNEE
        for (const elmt of data) {
            sum = 0;
            let y = elmt.datetime.substring(0, 4);
    
            // POUR TOUTES LES ANNEES
            if (year == "all") {
                if (elmt.day_of_week == day && elmt.place == place) {
                    nbOfDay += 1;
                    sum = 0;
                    for (const key of Object.keys(elmt)) {
                        if (elmt[key] != "" && key != "datetime" && key != "day_of_week" && key != "total" && key != "place") {
                            sum += parseInt(elmt[key])                           
                        }
                    }                    
                    dataNumber.push(sum);
                    dataDate.push(elmt.datetime); 
                    if(sum > max) {
                        max = sum;
                        dayMax = elmt.datetime;
                    }
                }
            } else {
                // POUR UNE ANNEE DONNEE
                if (elmt.day_of_week == day && elmt.place == place && y == year) {
                    nbOfDay += 1;
                    sum = 0;
                    for (const key of Object.keys(elmt)) {
                        if (elmt[key] != "" && key != "datetime" && key != "day_of_week" && key != "total" && key != "place") {
                            sum += parseInt(elmt[key])                           
                        }
                    }                    
                    dataNumber.push(sum);
                    dataDate.push(elmt.datetime); 
                    if(sum > max) {
                        max = sum;
                        dayMax = elmt.datetime;
                    }
                }
            }
            total += sum;
        }
        mean = total / nbOfDay;
        return res.status(200).json({ "mean": mean, "nbOfDay": nbOfDay, "dayMax": dayMax, "max": max, "number": dataNumber, "date": dataDate });
    }

}

const getTotalSales = (req,res) => {

    let data = readFile();

    // Récupération des parametres de la requête
    let place = req.body.place;
    let product = req.body.product;

    let dataByPlace = [];
    let dataCleaned = [];
    let monthToReturn = [];
    let totalToReturn = [];
    let currentMonth = 0;
    let currentYear = 0;
    let sum = 0;
    let index = 0;

    // Recupération par magasin
    if(place != "tous") {
        for(const elmt of data) {
            if(elmt.place == place) {
                dataByPlace.push(elmt);
            }
        }
    } 
    else {
        for(const elmt of data) {            
            dataByPlace.push(elmt);
        }
    }

    // POUR LES VENTES TOTALES
    if(product == "tous") {
        dataCleaned = dataByPlace.map(elmt => ({
            date: new Date(elmt.datetime),
            total: elmt.total,
        }))
    }
    else {
        for(const elmt of dataByPlace) {
            let amount = 0;
            if(elmt[product] != "") {
                amount = parseInt(elmt[product])
            }
            dataCleaned.push({"date": new Date(elmt.datetime), "total": amount})
        }
    }

    dataCleaned.sort((a,b) => {
        return a.date - b.date;
    })

    if(dataCleaned[0] != null) {
        currentMonth = dataCleaned[0].date.getMonth();
        currentYear = dataCleaned[0].date.getFullYear();
    }

    for(const elmt of dataCleaned) {
        
        let m = elmt.date.getMonth();
        let y = elmt.date.getFullYear();

        if(currentMonth != m || index == dataCleaned.length-1) {
            if(index == dataCleaned.length-1) {
                sum += parseInt(elmt.total);  
            }
            let monthToDisplay;
            if(currentMonth < 9) {
                monthToDisplay = "0" + (currentMonth+1);
            }
            else {
                monthToDisplay = currentMonth+1;
            }
            let date = currentYear + " - " + monthToDisplay;            
            monthToReturn.push(date);
            totalToReturn.push(sum);

            sum = 0;
            currentMonth = parseInt(m);    
            if(currentMonth == 0) {
                currentYear = parseInt(y);
            }
        }              
        index++;       
        sum += parseInt(elmt.total);  
    }

    return res.status(200).json({"monthArray" : monthToReturn, "totalArray": totalToReturn})
    // return res.status(200).json({"data" : dataCleaned})
    
}

const getTotalSalesByday = (req, res) => {

    let data = readFile();

    // Récupération des parametres de la requête
    let place = req.body.place;
    let product = req.body.product;

    let dataByPlace = [];
    let dataCleaned = [];
    let dayToReturn = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    let totalToReturn = [];
    let lundi = 0;
    let mardi = 0;
    let mercredi = 0;
    let jeudi = 0;
    let vendredi = 0;
    let samedi = 0;
    let dimanche =0;

     // Recupération par magasin
     if(place != "tous") {
        for(const elmt of data) {
            if(elmt.place == place) {
                dataByPlace.push(elmt);
            }
        }
    } 
    else {
        for(const elmt of data) {            
            dataByPlace.push(elmt);
        }
    }

    // POUR LES VENTES TOTALES
    if(product == "tous") {
        dataCleaned = dataByPlace.map(elmt => ({
            date: new Date(elmt.datetime),
            total: elmt.total,
        }))
    }
    else {
        for(const elmt of dataByPlace) {
            let amount = 0;
            if(elmt[product] != "") {
                amount = parseInt(elmt[product])
            }
            dataCleaned.push({"date": new Date(elmt.datetime), "total": amount})
        }
    }

    dataCleaned.sort((a,b) => {
        return a.date - b.date;
    })

    for(const elmt of dataCleaned) {
        let d = elmt.date.getDay();

        switch(d) {
            case 0: 
                dimanche += parseInt(elmt.total);
                break;
            case 1: 
                lundi += parseInt(elmt.total);
                break;
            case 2: 
                mardi += parseInt(elmt.total);
                break;
            case 3: 
                mercredi += parseInt(elmt.total);
                break;
            case 4: 
                jeudi += parseInt(elmt.total);
                break;
            case 5: 
                vendredi += parseInt(elmt.total);
                break;
            case 6: 
                samedi += parseInt(elmt.total);
                break;
        }
    }

    totalToReturn.push(lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche);
    return res.status(200).json({"dayArray" : dayToReturn, "totalArray": totalToReturn}) 
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

module.exports = { getStats, getTotalSales, getTotalSalesByday};