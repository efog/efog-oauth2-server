const TableStorageAdapter = require("./azure/table-storage-adapter").TableStorageAdapter;
const Promise = require('bluebird');
const crypto = require('crypto');
const moment = require('moment');
const azure = require('azure-storage');
const errors = require('../../tools/errors');
const messages = require('../messages').Messages;

/**
 * Authorization code class
 * 
 * @class AuthorizationCode
 */
class AuthorizationCode {

    /**
     * Creates an instance of AuthorizationCode.
     * 
     * @param {AuthorizationCode} authCode copy value
     * 
     * @memberOf AuthorizationCode
     */
    constructor(authCode) {
        this._code = authCode ? authCode.code : null;
        this._expiry = authCode ? moment(authCode.expiry) : null;
        this._creationDate = authCode ? moment(authCode.creationDate) : null;
        this._token = authCode ? authCode.token : null;
        this._clientId = authCode ? authCode.clientId : null;
        this._redirectUrl = authCode ? authCode.redirectUrl : null;
        Object.defineProperties(this, {
            "code": {
                "get": () => {
                    return this._code;
                },
                "set": (value) => {
                    this._code = value;
                }
            },
            "expiry": {
                "get": () => {
                    return this._expiry;
                },
                "set": (value) => {
                    this._expiry = value;
                }
            },
            "creationDate": {
                "get": () => {
                    return this._creationDate;
                },
                "set": (value) => {
                    this._creationDate = value;
                }
            },
            "token": {
                "get": () => {
                    return this._token;
                },
                "set": (value) => {
                    this._token = value;
                }
            },
            "redirectUrl": {
                "get": () => {
                    return this._redirectUrl;
                },
                "set": (value) => {
                    this._redirectUrl = value;
                }
            },
            "clientId": {
                "get": () => { 
                    return this._clientId;
                },
                "set": (value) => {
                    this._clientId = value;
                }
            }
        });
    }

    /**
     * Saves authorization code
     * 
     * 
     * @memberOf authorizationCode
     * @returns {Promise} a save promise
     */
    save() {
        const entGen = azure.TableUtilities.entityGenerator;
        const entity = {
            "PartitionKey": entGen.String(AuthorizationCode.PartitionKey),
            "RowKey": entGen.String(this.code),
            "expiry": entGen.DateTime(this.expiry),
            "creationDate": entGen.DateTime(this.creationDate),
            "token": entGen.String(this.token),
            "redirectUrl": entGen.String(this.redirectUrl),
            "clientId": entGen.String(this.clientId)
        };
        const tableService = new TableStorageAdapter();
        return tableService.table("authorizationcodes")
            .then((success) => {
                return tableService.service.insertOrReplaceEntityAsync('authorizationcodes', entity);
            })
            .then((result) => {
                return this.code;
            });
    }
}
AuthorizationCode.PartitionKey = "authorizationcode";

/**
 * Reads authorization code from storage
 * 
 * @param {string} code authorization code
 * 
 * @returns {Promise} execution promise
 */
AuthorizationCode.fromCode = (code) => {
    const tableService = new TableStorageAdapter();
    return tableService.table("authorizationcodes")
        .then((success) => {
            if (!success) {
                throw new errors.SystemError(messages.AZURE_TABLE_ERROR);
            }
            return tableService.service.retrieveEntityAsync('authorizationcodes', AuthorizationCode.PartitionKey, code);
        })
        .then((result) => {
            const authCode = {
                "code": result.RowKey._,
                "expiry": result.expiry._,
                "creationDate": result.creationDate._,
                "token": result.token._,
                "clientId": result.clientId._,
                "redirectUrl": result.redirectUrl._
            };
            const authorizationCode = new AuthorizationCode(authCode);
            return authorizationCode;
        });
};
exports.AuthorizationCode = AuthorizationCode;