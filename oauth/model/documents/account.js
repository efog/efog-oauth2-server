const moment = require("moment");
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require("mongoose"));

/**
 * Define account document schema
 */
exports.AccountSchema = new mongoose.Schema({
    "accountName": {
        "index": true,
        "required": true,
        "type": String
    },
    "accountOwners": {
        "type": [String]
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
    "clients": {
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
    }
});
exports.AccountSchema.statics.findByName = function (name) {
    console.log(`finding by name ${name}`);

    return this.findOne({
        "accountName": name
    });
};
exports.AccountSchema.statics.findClientByClientId = function(clientId) {
    return this.findOne({
        "clients.clientId": clientId
    });
};
exports.Account = mongoose.model("account", exports.AccountSchema);