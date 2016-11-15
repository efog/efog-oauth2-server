const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const errors = require('../../../tools/errors');
const Logger = require('../../../tools/logger').Logger;

const logger = new Logger().logger;
const dbURI = process.env.APPSETTING_APP_MONGO_DB_URL || "mongodb://127.0.0.1:27017/efog-oauth2";

const mdbOptions = {
    "server": {
        "auto_reconnect": true,
        "poolSize": 5,
        "reconnectInterval": 2000,
        "autoReconnect": true,
        "reconnectTries": 10
    }
};

const connectWithRetry = function () {
    return mongoose.connect(dbURI, mdbOptions, function (err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            setTimeout(connectWithRetry, 5000);
        }
    });
};
connectWithRetry();

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function () {
    // console.log(`Mongoose default connection open to ${dbURI}`);
    Logger.info(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
    Logger.error(`Mongo DB error: ${err.message}`);
    mongoose.disconnect();
    connectWithRetry();
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
    Logger.error("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection 
process.on("SIGINT", function () {
    mongoose.connection.close(function () {
        Logger.error("Mongoose default connection disconnected through app termination");
        throw new errors.ApplicationError(`MongoDB Connection closed`);
    });
}); 