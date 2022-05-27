var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');

/**
 * Configuring the environmental varaibles
 */
var dotenv = require('dotenv');
dotenv.config();

/**
 * Forming the mongo URI for connecting to the database
 */
var mongoose = require('mongoose');
var password = encodeURIComponent(process.env.PASSWORD);
var username = process.env.DBUSER;
const mongo_uri = `mongodb+srv://${username}:${password}@lyearn.ipvec.mongodb.net/?retryWrites=true&w=majority`;

console.log(mongo_uri);

/**
 * Connecting to the mongo db database
 */
mongoose.connect(
	mongo_uri,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	},
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Connected to Lyearn Database');
		}
	}
);
// initialize the mongoose-auto-increment package
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var app = express();

/**
 * Importing the routes for different end-points
 * < progress >
 */
let blog = require('./routes/blog');
let authorization = require('./routes/authorization');

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for cookie parser
app.use(cookieParser());

// logging the request being sent to the API
app.use(logger('dev'));

// CORS for cross-origin application
app.use(cors());
app.options('*', cors());

/**
 * Specifying the routes for the different functionality
 */
app.use('/lyearn/api/v1/blog', blog);
app.use('/lyearn/api/v1/authorization', authorization);

module.exports = app;
