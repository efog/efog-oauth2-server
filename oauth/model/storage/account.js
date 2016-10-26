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
        "clientId": {
            "index": true,
            "required": true,
            "type": String
        },
        "clientSecret": {
            "required": true,
            "type": String
        },
        "applicationName": {
            "type": String,
            "required": true
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
exports.AccountSchema.statics.create = (argv) => {
    const promise = new Promise((resolve, reject) => {

        const account = new exports.Account();
        account.accountName = argv.accountName;
        account.accountOwner = argv.accountOwner;
        account.accountManagers = [];
        account.effectiveDate = moment();
        account.terminationDate = moment("2099/01/01", "YYYY/MM/DD", true).endOf("year");
        account.clients = [];

        return account.generateAccountSecret().then((key) => {
            account.accountSecret = key;

            return account.save()
                .then(resolve)
                .catch(reject);
        });
    });

    return promise;
};
exports.AccountSchema.statics.findByName = function (name) {
    return this.findOne({
        "accountName": name
    });
};
exports.AccountSchema.statics.findByClientId = function (clientId) {
    return this.findOne({
        "clients.clientId": clientId
    });
};
exports.AccountSchema.methods.generateAccountSecret = function () {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
        hmac.on('readable', () => {
            const data = hmac.read();
            if (data) {
                const val = data.toString('hex');

                return resolve(val);
            }

            return reject('NO HMAC');
        });

        hmac.write(`${this.accountName}$++++`);
        hmac.end();
    });

    return promise;
};


exports.Account = mongoose.model("account", exports.AccountSchema);
