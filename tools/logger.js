const Bunyan = require('bunyan');
const BunyanAzure = require('bunyan-azure');
const Path = require('path');

/**
 * Logger helper class
 * 
 * @class Logger
 */
class Logger {

    /**
     * Creates an instance of Logger.
     * 
     * 
     * @memberOf Logger
     */
    constructor() {
        if (!Logger.logger) {
            let options = Bunyan.LoggerOptions;
            options = {
                "name": "Efog OAuth2 Server",
                "src": process.env.NODE_ENV === "development",
                "streams": [
                    {
                        "level": "trace",
                        "stream": process.stdout
                    },
                    {
                        "level": "info",
                        "stream": new BunyanAzure.AzureStream({
                            "account": process.env.APP_AZURE_STORAGE_ACCOUNT_NAME,
                            "access_key": process.env.APP_AZURE_STORAGE_ACCOUNT_KEY,
                            "table": process.env.APP_AZURE_LOGGING_TABLE_NAME
                        })
                    }
                ]
            };
            Logger.logger = Bunyan.createLogger(options);
        }
    }

    get logger() {
        return Logger.logger;
    }
}


/*
 * request object filter (to be continued)
 */
Logger.reqSerializer = function (req) {
    return JSON.stringify({
        "username": req.username,
        "method": req.method,
        "url": req.url,
        "remoteAddress": req.remoteAddress
    });
};

/*
 * response object filter (to be continued)
 */
Logger.resSerializer = function (res) {
    return JSON.stringify({
        "statusCode": res.statusCode
    });
};

/*
 * error object filter (to be continued)
 */
Logger.errSerializer = function (err) {
    return {
        "message": err.message
    };
};

/**
 * Log debug
 * 
 * @param {any} message log message
 * @returns {undefined}
 */
Logger.debug = function (message) {
    Logger.logger.info(message);
};

/**
 * Log error
 * 
 * @param {any} message log message
 * @returns {undefined}
 */
Logger.error = function (message) {
    Logger.logger.error(message);
};

/**
 * Log info
 * 
 * @param {any} message log message
 * @returns {undefined}
 */
Logger.info = function (message) {
    Logger.logger.info(message);
};

/**
 * Log warn
 * 
 * @param {any} message log message
 * @returns {undefined}
 */
Logger.warn = function (message) {
    Logger.logger.warn(message);
};
Logger.logger = null;

exports.Logger = Logger;