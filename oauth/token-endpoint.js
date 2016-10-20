const Database = require('./model/storage/mongo/mongo-database');
const Account = require('./model/storage/account').Account;

/**
 * Token endpoint management class
 * 
 * @class TokenEndpoint
 */
class TokenEndpoint {

    /**
     * Handle password grant type
     * 
     * @param {any} grant grant definition
     * @param {any} callback method callback NodeJS format
     * @returns {undefined}
     */
    password(grant, callback) {

        return Account.findByName('account123456')
            .then((result) => {
                return callback(null, result);
            })
            .catch((error) => {
                return callback(error, null);
            });
    }
}
exports.TokenEndpoint = TokenEndpoint;