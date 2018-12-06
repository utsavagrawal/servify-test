// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Point Code - 
 * 1 -> Circle Center
 * 2 -> Circle Radius
 * 3 -> Rectangle NorthEast
 * 4 -> Rectangle Southwest
 * 5 -> Polygon Point
 */

var NestedLatLngSchema = new Schema({
    lat: {
        type: Number
    },
    lng: {
        type: Number
    },
    length: {
        type: Number
    },
    pointCode: {
        type: Number,
        required: true
    }
});

/*
 * Type Codes
 * 1 -> Circle
 * 2 -> Rectangle
 * 3 -> Polygon
 */

var NestedPointsSchema = new Schema({
    latLngInfo: {
        type: [NestedLatLngSchema]
    },
    type: {
        type: String,
        required: true
    }
});

var serviceableAreasSchema = new Schema({
    pointsData: {
        type: [NestedPointsSchema]
    },    
    createdDate: {
        type: Date,
        default: Date.now()
    },
    //can hold user names for generalising this application for multiple users
    createdBy: {
        type: Schema.Types.ObjectId,
        //ref: 'user_db_collection_name'
    }

}, {collection: 'serviceableAreas'});

// Compile model from schema
var serviceableAreas = mongoose.model('serviceableAreas', serviceableAreasSchema);

module.exports = serviceableAreas;