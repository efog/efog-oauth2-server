const errors = require('../tools/errors');
const messages = require('./messages').Messages;
const Account = require('./model/account').Account;
const Logger = require('../tools/logger').Logger;
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

    /**
     * Handles client_credentials grant type
     * 
     * @param {any} grant grant definition
     * @param {any} callback grant callback
     * @returns {undefined}
     * 
     * @memberOf TokenEndpoint 
     */
    clientCredentials(grant, callback) {
        return TokenService.authenticateClientCredentials(grant)
            .then((account) => {
                if (!account) {
                    throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
                }
                return TokenService.getJwt(account);
            })
            .then((token) => {
                callback(null, {
                    "access_token": token,
                    "token_type": "Bearer"
                });
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
        return TokenService.authenticateClientCredentials(grant)
            .then((authorized) => {
                if (!authorized) {
                    throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
                }
                return TokenService.getBearerTokenFromCode(grant);
            })
            .then((token) => {
                callback(null, token);
            })
            .catch((error) => {
                callback(error, null);
            });
    }
}
exports.TokenEndpoint = TokenEndpoint;