const TokenService = require('./token-service').TokenService;

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
}
exports.TokenEndpoint = TokenEndpoint;