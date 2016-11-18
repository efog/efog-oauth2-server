const Promise = require('bluebird');
const moment = require('moment');
const azure = require('azure-storage');
const errors = require('../../tools/errors');
const messages = require('../messages').Messages;

/**
 * Grant Audit trace entity
 * 
 * @class GrantAuditTrace
 */
class GrantAuditTrace {

    /**
     * Creates an instance of GrantAuditTrace.
     * 
     * 
     * @memberOf GrantAuditTrace
     */
    constructor() {

        this._accountName = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_NAME;
        this._accountKey = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_KEY;

        this._properties = {};

        Object.defineProperties(this, {
            "queueService": {
                "get": () => {
                    if (!this._queueService) {
                        this._queueService = Promise.promisifyAll(azure.createQueueService(this._accountName, this._accountKey));
                    }
                    return this._queueService;
                }
            },
            "username": {
                "get": () => {
                    return this._properties.username ? this._properties.username : "";
                },
                "set": (value) => {
                    this._properties.username = value;
                }
            },
            "grantType": {
                "get": () => {
                    return this._properties.grantType ? this._properties.grantType : "";
                },
                "set": (value) => {
                    this._properties.grantType = value;
                }
            },
            "code": {
                "get": () => {
                    return this._properties.code ? this._properties.code : "";
                },
                "set": (value) => {
                    this._properties.code = value;
                }
            },
            "clientId": {
                "get": () => {
                    return this._properties.clientId ? this._properties.clientId : "";
                },
                "set": (value) => {
                    this._properties.clientId = value;
                }
            },
            "authorization": {
                "get": () => {
                    return this._properties.authorization ? this._properties.authorization : "";
                },
                "set": (value) => {
                    this._properties.authorization = value;
                }
            },
            "success": {
                "get": () => {
                    return this._properties.success ? this._properties.success : "";
                },
                "set": (value) => {
                    this._properties.success = value;
                }
            },
            "error": {
                "get": () => {
                    return this._properties.error ? this._properties.error : "";
                },
                "set": (value) => {
                    this._properties.error = value;
                }
            }
        });

        /**
         * Saves grant audit trace
         * 
         * @returns {Promise} execution Promise
         * 
         * @memberOf GrantAuditTrace
         */
        this.save = () => {
            return this.queueService.createQueueIfNotExistsAsync(GrantAuditTrace.QueueName).
                then(() => {
                    return this.queueService.createMessageAsync(GrantAuditTrace.QueueName, JSON.stringify(this._properties));
                });
        };
    }
}

GrantAuditTrace.QueueName = "granttraces";
GrantAuditTrace.PartitionKey = "grantaudittrace";

exports.GrantAuditTrace = GrantAuditTrace;