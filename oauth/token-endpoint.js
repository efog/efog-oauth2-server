const TokenService = require('./token-service').TokenService;
const Logger = require('../tools/logger').Logger;

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
        return TokenService.getBearerToken(grant.username, grant.password)
            .then((token) => {
                callback(null, token);
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
     * Handles authorization code grant type
     * 
     * @param {any} grant grant parameters
     * @param {any} callback execution callback
     * @returns {undefined}
     * 
     * @memberOf TokenEndpoint
     */
    authorizationCode(grant, callback) {

    }
}
exports.TokenEndpoint = TokenEndpoint;