const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
var bodyParser = require('body-parser');
//Import the mongoose module
var mongoose = require('mongoose');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//for static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));

app.listen(port, () => console.log("Servify Test app listening on port "+port+"!"));

//Set up default mongoose connection
//var mongoDB = 'mongodb://127.0.0.1/servify-map';

//mlab
var mongoDB = 'mongodb://servify-admin:servify0612@ds243041.mlab.com:43041/servify-map';

mongoose.connect(mongoDB, {useNewUrlParser: true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

db.once('open', function () {
    // we're connected!
    console.log("Connected to MongoDB");

});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/', require('./routes/index'));

module.exports = app;