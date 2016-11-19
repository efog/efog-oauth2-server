const Account = require('./model/account').Account;
const TokenService = require('./token-service').TokenService;
const GrantAuditTrace = require('./model/grant-audit-trace').GrantAuditTrace;
const Logger = require('../tools/logger').Logger;
const atob = require('atob');
const moment = require('moment');

/**
 * Audit trace service
 * 
 * @class AuditService
 */
class AuditService {

    /**
     * Creates an instance of AuditService.
     * 
     * 
     * @memberOf AuditService
     */
    constructor() {
        this._logger = new Logger().logger;
    }

    /**
     * Process grant audit trace
     * 
     * @param {any} message audit trace message
     * @returns {Promise} execution promise
     * 
     * @memberOf AuditService
     */
    processGrantAuditTrace(message) {
        const messageObject = JSON.parse(atob(message.messageText));
        this._logger.debug(`${messageObject.grantType}.`);

        let promise = null;
        if (messageObject.grantType === "password") {
            promise = Account.findByName(messageObject.username);
        }
        else if (messageObject.grantType === "client_credentials") {
            const basicAuth = TokenService.getBasicAuthInfo(message.authorization);
            promise = Account.findByApplicationKey(basicAuth.name);
        }
        else {
            return new Promise((resolve, reject) => {
                return resolve(message);
            });
        }
        return promise
            .then((account) => {
                if (account) {
                    if (!account.activity) {
                        account.activity = {
                            "lastSuccessfulAuthentication": null,
                            "lastFailedAuthentication": null,
                            "events": []
                        };
                    }
                    account.activity.lastSuccessfulAuthentication = messageObject.success ? moment() : account.activity.lastSuccessfulAuthentication;
                    account.activity.lastFailedAuthentication = messageObject.success ? account.activity.lastFailedAuthentication : moment();
                    account.activity.events.push({
                        "origin": messageObject.originAddress,
                        "clientId": messageObject.clientId,
                        "grantType": messageObject.grantType,
                        "success": messageObject.success,
                        "timestamp": messageObject.timestamp
                    });
                    return account.save()
                        .then(() => {
                            return message;
                        });
                }
                return message;
            });
    }

    /**
     * Pushes grant audit trace to queue
     * 
     * @param {any} grant request grant definition
     * @param {any} error error generated if any
     * 
     * @returns {promise} execution promise
     * 
     * @memberOf AuditService
     */
    pushGrantAuditTrace(grant, error) {
        const trace = new GrantAuditTrace();
        trace.grantType = grant.grant_type;
        trace.username = grant.username;
        trace.code = grant.code;
        trace.clientId = grant.client_id;
        trace.authorization = grant.authorization;
        trace.success = error === null;
        trace.error = error ? error.message : null;
        trace.originAddress = grant.origin_address;
        trace.timestamp = moment();
        return trace.save()
            .then(() => {
                return;
            })
            .catch((err) => {
                this._logger.error(err.message);
            });
    }
}
exports.AuditService = AuditService;