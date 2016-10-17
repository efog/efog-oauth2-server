const mongooseDB = require('./model/storage/mongoose-db');
const bluebird = require('bluebird');

/**
 * Token endpoint management class
 * 
 * @class TokenEndpoint
 */
class TokenEndpoint {

    /**
     * Creates an instance of TokenEndpoint.
     * 
     */
    constructor() {
        this._db = new mongooseDB.MongooseDB();
    }

    /**
     * Handle password grant type
     * 
     * @param {any} grant grant definition
     * @param {any} callback method callback NodeJS format
     * @returns {undefined}
     */
    password(grant, callback) {
        return callback(null, null);
    }
}
exports.TokenEndpoint = TokenEndpoint;