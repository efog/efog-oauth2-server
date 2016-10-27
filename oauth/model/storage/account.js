const moment = require("moment");
const mongoose = require("mongoose");
const crypto = require('crypto');

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
 * Finds accounts by application name and account name
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
 * Adds an application to the account
 * 
 * @param {string} applicationName application name
 * @param {string} applicationDescription application description
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.methods.addApplication = function (applicationName, applicationDescription) {
    return this.generateApplicationSecret(applicationName)
        .then((secret) => {
            const app = {
                "applicationName": applicationName,
                "applicationSecret": secret,
                "applicationDescription": applicationDescription,
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
                return reject('Password doesn\'t match key');
            })
            .catch(reject);
    });
    return promise;
};


exports.Account = mongoose.model("account", exports.AccountSchema);
