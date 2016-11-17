const TableStorageAdapter = require("./azure/table-storage-adapter").TableStorageAdapter;
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
        Object.defineProperties(this, {
            "username": {
                "get": () => {
                    return this._username;
                },
                "set": (value) => {
                    this._username = value;
                }
            },
            "grantType": {
                "get": () => {
                    return this._grantType;
                },
                "set": (value) => {
                    this._grantType = value;
                }
            },
            "code": {
                "get": () => {
                    return this._code;
                },
                "set": (value) => {
                    this._code = value;
                }
            },
            "clientId": {
                "get": () => {
                    return this._clientId;
                },
                "set": (value) => {
                    this._clientId = value;
                }
            },
            "authorization": {
                "get": () => {
                    return this._authorization;
                },
                "set": (value) => {
                    this._authorization = value;
                }
            },
            "success": {
                "get": () => {
                    return this._success;
                },
                "set": (value) => {
                    this._success = value;
                }
            },
            "error": {
                "get": () => {
                    return this._error;
                },
                "set": (value) => {
                    this._error = value;
                }
            }
        });
    }

    /**
     * Saves grant audit trace
     * 
     * @returns {Promise} execution Promise
     * 
     * @memberOf GrantAuditTrace
     */
    save() {
        const entGen = azure.TableUtilities.entityGenerator;
        // const entity = {
        //     "PartitionKey": entGen.String(AuthorizationCode.PartitionKey),
        //     "RowKey": entGen.String(this.code),
        //     "expiry": entGen.DateTime(this.expiry),
        //     "creationDate": entGen.DateTime(this.creationDate),
        //     "token": entGen.String(this.token),
        //     "redirectUri": entGen.String(this.redirectUri),
        //     "clientId": entGen.String(this.clientId)
        // };
        // const tableService = new TableStorageAdapter();
        // return tableService.table("authorizationcodes")
        //     .then((success) => {
        //         return tableService.service.insertOrReplaceEntityAsync('authorizationcodes', entity);
        //     });
    }
}
GrantAuditTrace.PartitionKey = "grantaudittrace";

exports.GrantAuditTrace = GrantAuditTrace;