const Joi = require('joi');
const express = require('express')
const fetch = require("node-fetch");
const cors = require('cors')

const app = express();
app.use(express.json())

app.options("/*", cors({origin: '*'}));

const CP_SERVER = 'https://7ywg61mqp6.execute-api.us-east-1.amazonaws.com'
const BK_SERVER = 'https://lo2frq9f4l.execute-api.us-east-1.amazonaws.com'

app.post('/rates/best', cors({origin: '*'}), async (req, res) => {
    // input validation
    const { error } = validateInput(req.body)
    if (error) return res.status(400).send({error: error.details[0].message});

    // fix input after validation if there is any extra whitespace
    const address = extractAndTrim(req.body);

    // get all rates in one array
    let allRates = []
    // Canada Post
    try {
        allRates.push(...await doRequest(`${CP_SERVER}/prod/rates/${address.postalCode}`, 'CP'));
    } catch(e) {
        console.log(e);
    }
    // BoxKnight
    try {
        allRates.push(...await doRequest(`${BK_SERVER}/prod/rates/${address.postalCode}`, 'BK'));
    } catch(e) {
        console.log(e);
    }

    // get best rate
    // if nothing in the array we send message that no rates were found
    if (allRates.length === 0) return res.status(400).send("No rates found");
    // use helper function to get the best rate
    const bestRate = getBestRate(allRates);
    res.send(bestRate);

    // after responding create shipment with lowest rate
    createShipment(bestRate, address);
});

// helper functions
const validateInput = (address) => {
    const schema = {
        address_line_one: Joi.string().required().trim(),
        address_line_two: Joi.allow(null),
        city: Joi.string().required().trim(),
        province: Joi.string().min(2).required().trim(),
        postalCode: Joi.string().min(6).required().trim().replace(" ", "").regex(/^[A-Za-z][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$/).error(() => {return { message: 'Postal Code is not valid.',}}),
        country: Joi.string().min(2).required().trim(),
    }
    return Joi.validate(address, schema);
}

const extractAndTrim = (address) => {
    let fixed = address
    fixed.address_line_one = address.address_line_one.trim();
    fixed.address_line_two = address.address_line_two && address.address_line_two.trim();
    fixed.city = address.city.trim();
    fixed.province = address.province.trim();
    fixed.postalCode = address.postalCode.trim().replace(" ", "");
    fixed.country = address.country.trim();
    return fixed;
}

// for calling the API
// adds a key to know which API was called when we create a shipment
const doRequest = async (url, key) => {
    const response = await fetch(url);
    return (await response.json()).map(e => {return {...e, key};})
}

const getBestRate = (rates) => {
    //console.log(rates)
    // get minimum price in rates
    const minPriceRate = rates.reduce((previous, current) => (previous.price < current.price) ? previous : current); 

    // filter the array to only include objects that have min price as there may be more than one
    const minRates = rates.filter(elem => elem.price === minPriceRate.price);
    
    // if there is only one of them then there are no ties so just return the object
    if (minRates.length == 1) return minRates[0];

    // get the object with minimum estimated days
    const minPriceDays = minRates.reduce((previous, current) => previous.estimate_days < current.estimate_days ? previous : current);
    return minPriceDays;
}

const createShipment = async (rate, address) => {
    const payload = {rate_id: rate.id, destination: address }
    const url = rate.key === 'CP'? `${CP_SERVER}/prod/shipments` : `${BK_SERVER}/prod/shipments`
    try {
        const res = await callApi(url, payload);
        console.log("Shipment created using " + JSON.stringify(payload))
        console.log("Shipment response = " + JSON.stringify(res))
    } catch(e) {console.log(e)}
}

const callApi = async (url, payload) => {
    const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
    const jsonResp = await resp.json();
    return jsonResp;
}
module.exports = app