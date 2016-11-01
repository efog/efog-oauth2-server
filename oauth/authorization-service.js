const Account = require('./model/account').Account;
const Logger = require('../tools/logger').Logger;
const Promise = require('bluebird');

const NO_CLIENT = "400 NO_CLIENT";

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
                    if (!account) {
                        return reject(new Error(NO_CLIENT));
                    }
                    for (let idx = 0; idx < account.clients.length; idx++) {
                        const client = account.clients[idx];
                        if (client.redirectUrl === redirectUrl) {
                            return resolve(client);
                        }
                    }
                    return reject(new Error(NO_CLIENT));
                })
                .catch((error) => {
                    return reject(error);
                });
        });
        return promise;
    }
}
exports.AuthorizationService = AuthorizationService;