const atob = require('atob');
const btoa = require('btoa');
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
     * Handles authorization code grant type
     * 
     * @param {any} grant grant parameters
     * @param {any} callback execution callback
     * @returns {undefined}
     * 
     * @memberOf TokenEndpoint
     */
    authorizationCode(grant, callback) {
        return this.authenticateClientCredentials(grant)
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

    /**
     * Authenticates application credentials
     * 
     * @param {any} grant grant request details
     * @returns {Promise} execution promise
     * 
     * @memberOf TokenEndpoint
     */
    authenticateClientCredentials(grant) {        
        const basicAuthRegex = new RegExp(/^Basic /g);
        const idPasswordRegex = new RegExp(/:/g);
        if (!basicAuthRegex.test(grant.authorization)) {
            throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
        }
        const basicAuth = atob(grant.authorization.split(' ')[1]);
        if (!idPasswordRegex.test(basicAuth)) {
            throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
        }
        return Account.findByApplicationKeyAndSecret(basicAuth.split(':')[0], basicAuth.split(':')[1]);
    }
}
exports.TokenEndpoint = TokenEndpoint;