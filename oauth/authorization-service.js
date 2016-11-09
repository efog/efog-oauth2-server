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
     * @param {any} clientId application identification
     * @param {any} redirectUrl redirection url
     * @param {any} scope requested scope
     * @returns {Promise} an execution promise
     * 
     * @memberOf AuthorizationService
     */
    clientAuthorizationRequestIsValid(clientId, redirectUrl, scope) {
        const promise = new Promise((resolve, reject) => {
            Account.findByApplicationKey(clientId)
                .then((account) => {
                    if (account) {
                        for (let idx = 0; idx < account.clients.length; idx++) {
                            const client = account.clients[idx];
                            if (client.redirectUrl === redirectUrl) {
                                return resolve(client);
                            }
                        }
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
     * @param {string} redirectUrl redirection url
     * @param {string} clientId client identifier
     * 
     * @returns {Promise} execution promise
     * 
     * @memberOf AuthorizationService
     */
    getAuthorizationCode(token, redirectUrl, clientId) {
        const code = new AuthorizationCode();
        code.code = guid();
        code.token = token;
        code.expiry = moment().add(1, 'month');
        code.creationDate = moment();
        code.clientId = clientId;
        code.redirectUrl = redirectUrl;
        return code.save();
    }
}
exports.AuthorizationService = AuthorizationService;