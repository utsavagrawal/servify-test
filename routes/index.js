var express = require('express');
var router = express.Router();
var serviceableAreas = require('../models/serviceableAreas');

router.get('/', (req, res) => {
    res.render('index.ejs');
});

router.post('/saveMapData', (req, res) => {
    let data = req.body.data;
    let pointsData = [];
    for (let i = 0; i < data.length; i++) {
        let latLngInfo = [];
        if (data[i].type == "Polygon") {
            //polygon
            for (let j = 0; j < data[i].latLngInfo.length; j++) {
                latLngInfo.push({
                    lat: data[i].latLngInfo[j].lat,
                    lng: data[i].latLngInfo[j].lng,
                    pointCode: 5
                });
            }
        } else if (data[i].type == "Rectangle") {
            //rectangle
            //northeast
            latLngInfo.push({
                lat: data[i].lat1,
                lng: data[i].lng1,
                pointCode: 3
            });
            //southwest
            latLngInfo.push({
                lat: data[i].lat2,
                lng: data[i].lng2,
                pointCode: 4
            });
        } else if (data[i].type == "Circle") {
            //circle
            latLngInfo.push({
                lat: data[i].lat,
                lng: data[i].lng,
                pointCode: 1
            });
            latLngInfo.push({
                length: data[i].radius,
                pointCode: 2
            });
        }
        let thisPoint = {
            latLngInfo: latLngInfo,
            type: data[i].type
        };
        pointsData.push(thisPoint);
    }
    serviceableAreas.create({pointsData: pointsData}, (error, response) => {
        if (error) {
            return res.send({error: 1, msg: "Something went wrong", data: error});
        }
        return res.send({error: 0, msg: "Successfully saved", data: pointsData});
    });
});

router.get('/getMapData', (req, res) => {
    serviceableAreas.
            findOne()
            .sort({createdDate: -1})
            .exec((error, response) => {
                if (error) {
                    return res.send({error: 1, msg: "Something went wrong", data: error});
                }
                return res.send({error: 0, msg: "Latest Map Data", data: response});
            });
});

router.get('/checkServiceability', (req, res) => {
    res.render('checkServiceability.ejs');
});

module.exports = router;