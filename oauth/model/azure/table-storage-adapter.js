const Promise = require('bluebird');
const azure = require('azure-storage');
const errors = require('../../../tools/errors');

/**
 * 
 * 
 * @class TableStorageAdapter
 */
class TableStorageAdapter {

    /**
     * Creates an instance of TableStorageAdapter.
     * 
     * @memberOf TableStorageAdapter
     */
    constructor() {
        const accountName = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_KEY;
        if (!accountName) {
            throw new errors.ApplicationError(`APPSETTING_APP_AZURE_STORAGE_ACCOUNT_NAME environment variable missing`);
        }
        if (!accountKey) {
            throw new errors.ApplicationError(`APPSETTING_APP_AZURE_STORAGE_ACCOUNT_KEY environment variable missing`);
        }
        this._tableService = Promise.promisifyAll(azure.createTableService(accountName, accountKey));
    }

    /**
     * Returns Azure table service
     * 
     * @readonly
     * 
     * @memberOf TableStorageAdapter
     */
    get service() {
        return this._tableService;
    }

    /**
     * Returns azure table by name and creates it if it doesn't exist
     * 
     * @param {any} name table name
     * 
     * @memberOf TableStorageAdapter
     * @returns {promise} a promise fulfilling the table get operation
     */
    table(name) {
        return this._tableService.createTableIfNotExistsAsync(name);
    }
}
exports.TableStorageAdapter = TableStorageAdapter;