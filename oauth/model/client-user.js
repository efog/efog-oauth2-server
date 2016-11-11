const TableStorageAdapter = require("./azure/table-storage-adapter").TableStorageAdapter;
const Promise = require('bluebird');
const crypto = require('crypto');
const moment = require('moment');
const azure = require('azure-storage');
const errors = require('../../tools/errors');

/**
 * ClientUser class
 * 
 * @class ClientUser
 */
class ClientUser {

    /**
     * Creates an instance of User.
     * 
     * @param {string} clientId client identification
     * @param {string} username username
     * @param {string} userkey userkey
     * @param {Boolean} isActive isActive
     * @param {Date} expiry expiry
     * 
     * @memberOf ClientUser
     */
    constructor(clientId, username, userkey, isActive, expiry) {
        this._clientId = clientId;
        this._username = username;
        this._userkey = userkey;
        this._isActive = isActive;
        this._expiry = expiry;
    }

    get clientId() {
        return this._clientId;
    }
    set clientId(value) {
        return this._clientId;
    }

    get username() {
        return this._username;
    }
    set username(value) {
        return this._username;
    }

    get expiry() {
        return this._expiry;
    }
    set expiry(value) {
        this._expiry = value;
    }

    get userkey() {
        return this._userkey;
    }
    set userkey(value) {
        this._userkey = value;
    }

    get isActive() {
        return this._isActive;
    }
    set isActive(value) {
        this._isActive = value;
    }

    /**
     * Saves client user;
     * 
     * 
     * @memberOf ClientUser
     * @returns {Promise} a save promise
     */
    save() {
        const entGen = azure.TableUtilities.entityGenerator;
        const entity = {
            "PartitionKey": entGen.String(this.clientId),
            "RowKey": entGen.String(this.userkey),
            "username": entGen.String(this.username),
            "isActive": entGen.Boolean(this.isActive),
            "expiry": entGen.DateTime(this.expiry)
        };
        const tableService = new TableStorageAdapter().service;
        const promise = new Promise((resolve, reject) => {
            return tableService.insertOrReplaceEntityAsync('clientusers', entity)
                .then((result) => {
                    resolve(result);
                })
                .catch(reject);
        });

        return promise;
    }
}

/**
 * Generates a userkey for specific clientid
 * 
 * @param {string} clientId client identificatioin
 * @param {string} username users username
 * @param {string} password users password
 * 
 * @returns {Promise} a userkey Promise
 */
ClientUser.generateUserkey = function (clientId, username, password) {
    if (!process.env.APPSETTING_APP_HMAC_SECRET) {
        throw new errors.ApplicationError('NO APP HMAC SECRET');
    }
    const promise = new Promise((resolve, reject) => {
        try {
            const hmac = crypto.createHmac('sha256', process.env.APPSETTING_APP_HMAC_SECRET);
            const hash = hmac.update(`${username}${clientId}++++${password}`).digest('hex');
            resolve(hash);
        }
        catch (error) {
            reject(error);
        }
    });

    return promise;
};

/**
 * Gets client user for clientid, username and password
 * 
 * @param {string} clientId client identification
 * @param {string} userkey users key
 * @param {string} username users username
 * @param {string} password users password
 * 
 * @returns {Promise} a fetch promise
 */
ClientUser.fetch = function (clientId, userkey, username, password) {
    const tableService = new TableStorageAdapter();
    const promise = new Promise((resolve, reject) => {
        const retrieveEntityResolve = (clientUserEntity) => {
            const clientUser = new ClientUser(clientUserEntity.PartitionKey._, clientUserEntity.username._, clientUserEntity.RowKey._, clientUserEntity.isActive._, moment(clientUserEntity.expiry._));

            return resolve(clientUser);
        };
        const userkeyResolve = (hash) => {
            const tableAdapterResolve = (tableAdapter) => {
                if (!tableAdapter.isSuccessful) {
                    return reject('Azure Table not found and not created');
                }

                return tableService.service.retrieveEntityAsync('clientusers', clientId, hash)
                    .then(retrieveEntityResolve)
                    .catch(reject);
            };

            return tableService.table("clientusers")
                .then(tableAdapterResolve)
                .catch(reject);
        };
        if (userkey) {
            return tableService.service.retrieveEntityAsync('clientusers', clientId, userkey)
                .then(retrieveEntityResolve)
                .catch(reject);
        }

        return ClientUser.generateUserkey(clientId, username, password)
            .then(userkeyResolve)
            .catch(reject);
    });

    return promise;
};
exports.ClientUser = ClientUser;