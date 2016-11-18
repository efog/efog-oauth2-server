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
     * 
     * @returns {Promise} execution promise
     */
    password(grant) {
        return TokenService.getBearerToken(grant.username, grant.password);
    }

    /**
     * Handles client_credentials grant type
     * 
     * @param {any} grant grant definition
     * 
     * @returns {Promise} execution promise
     * 
     * @memberOf TokenEndpoint 
     */
    clientCredentials(grant) {
        return TokenService.authenticateClientCredentials(grant)
            .then((account) => {
                if (!account) {
                    throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
                }
                return TokenService.getJwt(account);
            })
            .then((token) => {
                return {
                    "access_token": token,
                    "token_type": "Bearer"
                };
            });
    }

    /**
     * Handles authorization code grant type
     * 
     * @param {any} grant grant parameters
     * 
     * @returns {Promise} execution promise
     * 
     * @memberOf TokenEndpoint
     */
    authorizationCode(grant) {
        return TokenService.authenticateClientCredentials(grant)
            .then((authorized) => {
                if (!authorized) {
                    throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
                }
                return TokenService.getBearerTokenFromCode(grant);
            });
    }
}
exports.TokenEndpoint = TokenEndpoint;