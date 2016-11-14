const mongoose = require("mongoose");
const errors = require('../../../tools/errors');
const Logger = require('../../../tools/logger').Logger;

const logger = new Logger().logger;
const dbURI = process.env.APPSETTING_APP_MONGO_DB_URL || "mongodb://127.0.0.1:27017/efog-oauth2";

// Create the database connection 
mongoose.connect(dbURI);
mongoose.Promise = require('bluebird');

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function () {
    // console.log(`Mongoose default connection open to ${dbURI}`);
    Logger.info(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
    Logger.error(err.message);
    setTimeout(() => { 
        mongoose.disconnect();
        mongoose.connect(dbURI);
    }, 1000);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
    Logger.error("Mongoose default connection disconnected");
    setTimeout(() => {
        mongoose.disconnect();
        mongoose.connect(dbURI);
    }, 1000);
});

// If the Node process ends, close the Mongoose connection 
process.on("SIGINT", function () {
    mongoose.connection.close(function () {
        Logger.error("Mongoose default connection disconnected through app termination");
        throw new errors.ApplicationError(`MongoDB Connection closed`);
    });
}); 