const mongoose = require("mongoose");
const errors = require('../../../tools/errors');

const dbURI = process.env.APPSETTING_APP_MONGO_DB_URL || "mongodb://127.0.0.1:27017/efog-oauth2";

// Create the database connection 
mongoose.connect(dbURI);
mongoose.Promise = require('bluebird');

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function () {
    // console.log(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
    console.log(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
    console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection 
process.on("SIGINT", function () {
    mongoose.connection.close(function () {
        console.log("Mongoose default connection disconnected through app termination");
        throw new errors.ApplicationError(`MongoDB Connection closed`);
    });
}); 