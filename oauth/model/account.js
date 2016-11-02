const moment = require("moment");
const mongoose = require("mongoose");
const crypto = require('crypto');
const guid = require("../../tools/guid").guid;

/**
 * Define account document schema
 */
exports.AccountSchema = new mongoose.Schema({
    "accountName": {
        "index": true,
        "required": true,
        "type": String
    },
    "accountSecret": {
        "index": true,
        "required": true,
        "type": String
    },
    "accountOwner": {
        "index": true,
        "required": true,
        "type": String,
        "match": /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    "accountManagers": {
        "type": [String]
    },
    "effectiveDate": {
        "default": moment(),
        "required": true,
        "type": Date
    },
    "terminationDate": {
        "default": moment(),
        "required": true,
        "type": Date
    },
    "clients": [{
        "applicationSecret": {
            "required": true,
            "type": String
        },
        "applicationName": {
            "type": String,
            "required": true,
            "index": true
        },
        "applicationKey": {
            "type": String,
            "required": true,
            "index": true,
            "default": guid()
        },
        "applicationDescription": {
            "type": String,
            "required": true
        },
        "effectiveDate": {
            "default": moment(),
            "required": true,
            "type": Date
        },
        "terminationDate": {
            "default": moment(),
            "required": true,
            "type": Date
        },
        "redirectUrl": {
            "type": String,
            "required": true
        },
        "scopes": {
            "type": [String]
        }
    }]
});

/**
 * Creates an account
 * 
 * @param {Object} argv account creation arguments
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.create = (argv) => {
    const promise = new Promise((resolve, reject) => {

        const account = new exports.Account();
        account.accountName = argv.accountName;
        account.accountOwner = argv.accountOwner;
        account.accountManagers = [];
        account.effectiveDate = moment();
        account.terminationDate = moment("2099/01/01", "YYYY/MM/DD", true).endOf("year");
        account.clients = [];

        return account.generateAccountSecret(argv.accountPassword).then((key) => {
            account.accountSecret = key;

            return account.save()
                .then(resolve)
                .catch(reject);
        });
    });

    return promise;
};

/**
 * Finds account by name
 * 
 * @param {string} name account name
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByName = function (name) {
    return this.findOne({
        "accountName": name
    });
};

/**
 * Finds account by email
 * 
 * @param {string} email account registered email
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByEmail = function (email) {
    return this.findOne({
        "accountOwner": email
    });
};

/**
 * Finds account by application name and account name
 * 
 * @param {string} accountName account name
 * @param {string} applicationName application name
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByApplicationName = function (accountName, applicationName) {
    return this.findOne({
        "accountName": accountName,
        "clients.applicationName": applicationName
    });
};

/**
 * Finds account by application key
 * 
 * @param {string} applicationKey application name
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByApplicationKey = function (applicationKey) {
    return this.findOne({
        "clients.applicationKey": applicationKey
    });
};

/**
 * Finds account by name and password
 * 
 * @param {string} accountName account name
 * @param {string} accountPassword account password
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByNameAndPassword = function (accountName, accountPassword) {
    let targetAccount = null;
    const promise = new Promise((resolve, reject) => {
        exports.Account.findByName(accountName)
            .then((account) => {
                targetAccount = account;
                if (targetAccount) {
                    return account.validateOwnership(accountPassword);
                }
                return reject(new Error("401: ACCOUNT NOT FOUND"));
            })
            .then((isowner) => {
                if (isowner) {
                    return resolve(targetAccount);
                }
                return reject(new Error("401: ACCOUNT OWNERSHIP DENIED"));
            });
    });
    return promise;
};

/**
 * Adds a client to account and saves
 * 
 * @param {object} argv client arguments
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.addClient = function (argv) {
    const accountName = argv.accountName;
    const applicationName = argv.applicationName;
    const accountPassword = argv.accountPassword;
};

/**
 * Generate an account secret for instance with password
 * 
 * @param {string} password password to generate key against
 * @returns {Promise} a key generation promise
 */
exports.AccountSchema.methods.generateAccountSecret = function (password) {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
        const hash = hmac.update(`${this.accountName}$+++${password}+${this.accountOwner}`).digest('hex');
        resolve(hash);
    });

    return promise;
};

/**
 * Generate an application secret for instance
 * 
 * @param {string} applicationName application name
 * @returns {Promise} a key generation promise
 */
exports.AccountSchema.methods.generateApplicationSecret = function (applicationName) {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
        const hash = hmac.update(`${this.accountName}$+++${this.accountSecret}+${moment().format()}`).digest('hex');
        resolve(hash);
    });

    return promise;
};

/**
 * Generate an application key for instance
 * 
 * @param {string} applicationName application name
 * @returns {string} application key
 */
exports.AccountSchema.methods.generateApplicationKey = function (applicationName) {
    const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
    const hash = hmac.update(`${this.accountName}${applicationName}¯\_(ツ)_/¯${moment().format()}`).digest('hex');
    return hash;
};

/**
 * Adds an application to the account
 * 
 * @param {string} applicationName application name
 * @param {string} applicationDescription application description
 * @param {string} redirectUrl redirection url
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.methods.addApplication = function (applicationName, applicationDescription, redirectUrl) {
    return this.generateApplicationSecret(applicationName)
        .then((secret) => {
            const app = {
                "applicationName": applicationName,
                "applicationSecret": secret,
                "applicationDescription": applicationDescription,
                "applicationKey": this.generateApplicationKey(applicationName),
                "redirectUrl": redirectUrl,
                "terminationDate": moment("2099/01/01", "YYYY/MM/DD", true).endOf("year"),
                "scopes": ["*"]
            };
            this.clients.push(app);
            return this.save();
        });
};

/**
 * Validates that account instance matches the password
 * 
 * @param {string} password password to validate against
 * @returns {Promise} a promise following ownership validation
 */
exports.AccountSchema.methods.validateOwnership = function (password) {
    const promise = new Promise((resolve, reject) => {
        return this.generateAccountSecret(password)
            .then((key) => {
                if (key === this.accountSecret) {
                    return resolve(true);
                }
                return resolve(false);
            });
    });
    return promise;
};

/**
 * Account has client id
 * 
 * @param {string} clientId client identification
 * @returns {boolean} has clientid
 */
exports.AccountSchema.methods.hasClient = function (clientId) {
    for (let idx = 0; idx < this.clients.length; idx++) {
        if (this.clients[idx].applicationKey === clientId) {
            return true;
        }
    }
    return false;
};

exports.Account = mongoose.model("account", exports.AccountSchema);
