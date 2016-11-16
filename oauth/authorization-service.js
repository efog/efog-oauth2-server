const Account = require('./model/account').Account;
const AuthorizationCode = require('./model/authorization-code').AuthorizationCode;
const Logger = require('../tools/logger').Logger;
const Promise = require('bluebird');
const messages = require('./messages').Messages;
const errors = require('../tools/errors');
const guid = require('../tools/guid').guid;
const moment = require('moment');
const atob = require('atob');

/**
 * Authorization service class
 * 
 * @class AuthorizationService
 */
class AuthorizationService {

    /**
     * Creates an instance of AuthorizationService.
     * 
     * 
     * @memberOf AuthorizationService
     */
    constructor() {
        this.logger = new Logger();
    }

    /**
     * Checks if client id, redirect url and scope is valid
     * 
     * @param {string} clientId application identification
     * @param {string} redirectUri redirection url
     * @param {string} scope requested scope
     * @param {string} responseType requested response type
     * @returns {Promise} an execution promise
     * 
     * @memberOf AuthorizationService
     */
    clientAuthorizationRequestIsValid(clientId, redirectUri, scope, responseType) {
        const promise = new Promise((resolve, reject) => {
            Account.findByApplicationKey(clientId, redirectUri, scope, responseType)
                .then((account) => {
                    if (account) {
                        return resolve(account);
                    }
                    return reject(new errors.ClientError(messages.NO_CLIENT));
                })
                .catch((error) => {
                    return reject(error);
                });
        });
        return promise;
    }

    /**
     * Find account by account name
     * 
     * @param {any} accountName account name
     * @returns {Promise} execution promise
     * 
     * @memberOf AuthorizationService
     */
    findAccount(accountName) {
        return Account.findByName(accountName);
    }

    /**
     * Gets a stored authorization code for account and clientId
     * 
     * @param {string} token access token
     * @param {string} redirectUri redirection url
     * @param {string} clientId client identifier
     * 
     * @returns {Promise} execution promise
     * 
     * @memberOf AuthorizationService
     */
    getAuthorizationCode(token, redirectUri, clientId) {
        const code = new AuthorizationCode();
        code.code = guid();
        code.token = token;
        code.expiry = moment().add(5, 'minutes');
        code.creationDate = moment();
        code.clientId = clientId;
        code.redirectUri = redirectUri;
        return code.save();
    }
}
exports.AuthorizationService = AuthorizationService;