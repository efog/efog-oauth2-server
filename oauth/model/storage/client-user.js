const TableStorageAdapter = require("./azure/table-storage-adapter").TableStorageAdapter;
const Promise = require('bluebird');
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
const moment = require('moment');

/**
 * ClientUser class
 * 
 * @class ClientUser
 */
class ClientUser {

    /**
     * Creates an instance of User.
     * 
     * @param {any} clientId client identification
     * @param {any} userkey userkey
     * 
     * @memberOf ClientUser
     */
    constructor(clientId, userkey) {
        this._clientId = clientId;
        this._userkey = null;
        this._isActive = false;
        this._expiry = moment();
    }

    get clientId() {
        return this._clientId;
    }
    set clientId(value) {
        return this._clientId;
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
    save() { }
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
    const promise = new Promise((resolve, reject) => {
        hmac.on('readable', () => {
            const data = hmac.read();
            if (data) {
                return resolve(data.toString('hex'));
            }

            return reject('NO HMAC');
        });

        hmac.write(`${username}${clientId}++++${password}`);
        hmac.end();
    });

    return promise;
};

/**
 * Gets client user for clientid, username and password
 * 
 * @param {string} clientId client identificatioin
 * @param {string} username users username
 * @param {string} password users password
 * 
 * @returns {Promise} a fetch promise
 */
ClientUser.fetch = function (clientId, username, password) {
    const tableService = new TableStorageAdapter();
    const promise = new Promise((resolve, reject) => {
        const retrieveEntityResolve = (clientUserEntity) => {
            const clientUser = new ClientUser(clientId, clientUserEntity.userkey);

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

        return ClientUser.generateUserkey(clientId, username, password)
            .then(userkeyResolve)
            .catch(reject);
    });

    return promise;
};
exports.ClientUser = ClientUser;