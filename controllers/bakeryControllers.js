const fs = require('fs');
const brain = require("brain.js");

const getStats = (req, res) => {

    let day = req.body.day;
    let year = req.body.year;
    let product = req.body.product;
    let place = req.body.place;

    let data;
    let sum = 0;
    let mean = 0;
    let nbOfDay = 0;
    let dayMax = "";
    let max = 0;
    let dataNumber = [];
    let dataDate = [];
    let total = 0;

    try {
        data = JSON.parse(fs.readFileSync('./Bakery.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }

    if(product != "tous") {
        for (const elmt of data) {
            sum = 0;
            let y = elmt.datetime.substring(0, 4);
    
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
        for (const elmt of data) {
            sum = 0;
            let y = elmt.datetime.substring(0, 4);
    
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

const getMonthPrediction = async(req, res) => {

    let month = req.body.month;
    let product = req.body.product;
    let place = req.body.place;

    let data;
    let sum = 0;
    let mean = 0;
    let nbOfMonth = 0;
    let currentYear = "";
    let trainingData = [];

    try {
        data = JSON.parse(fs.readFileSync('./Bakery.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }

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


const getDayPrediction = async(req, res) => {

    let day = req.body.day;
    let product = req.body.product;
    let place = req.body.place;

    let data;
    let sum = 0;
    let mean = 0;
    let nbOfDay = 0;
    let trainingData = [];
    
    try {
        data = JSON.parse(fs.readFileSync('./Bakery.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }

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


const useTensor = (req, res) => {

      let data;

    try {
        data = JSON.parse(fs.readFileSync('./Bakery.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }

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

module.exports = { getStats, getMonthPrediction, getDayPrediction, useTensor };