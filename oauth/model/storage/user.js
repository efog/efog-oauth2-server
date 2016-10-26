const moment = require("moment");
const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * Define account document schema
 */
exports.UserSchema = new mongoose.Schema({
    "username": {
        "index": true,
        "required": true,
        "type": String,
        "match": /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    "userkey": {
        "required": true,
        "type": String
    },
    "active": {
        "required": true,
        "default": true,
        "type": Boolean
    },
    "confirmed": {
        "required": true,
        "default": true,
        "type": Boolean
    },
    "creationDate": {
        "required": true,
        "default": moment(),
        "type": Date
    },
    "clients": [
        {
            "clientId": {
                "required": true,
                "type": String
            },
            "active": {
                "required": true,
                "default": true,
                "type": Boolean
            },
            "creationDate": {
                "required": true,
                "default": moment(),
                "type": Date
            },
            "clientkey": {
                "required": true,
                "type": String
            }
        }
    ]
});
exports.UserSchema.functions.addClient = function () { };
exports.UserSchema.statics.findByUsernameAndUserkey = function (username, userkey) {
    return this.findOne({
        "username": username,
        "userkey": userkey,
        "active": true
    });
};
exports.UserSchema.statics.makePassword = function (username, password) {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);
        hmac.on('readable', () => {
            const data = hmac.read();
            if (data) {
                return resolve(data.toString('hex'));
            }

            return reject('NO HMAC');
        });

        hmac.write(`${username}++++${password}`);
        hmac.end();
    });
};

exports.User = mongoose.model("user", exports.UserSchema);