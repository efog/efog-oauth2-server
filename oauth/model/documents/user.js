const moment = require('moment');
const mongoose = require('mongoose');

/**
 * Define user schema
 */
exports.UserSchema = new mongoose.Schema({
    'client_ids': {
        'required': true,
        'type': [String]
    },
    'creation_date': {
        'default': moment(),
        'required': true,
        'type': Date
    },
    'modification_date': {
        'default': moment(),
        'required': true,
        'type': Date
    },
    'password': {
        'required': true,
        'type': String
    },
    'status': {
        'default': 'unconfirmed',
        'enum': ['active', 'inactive', 'unconfirmed'],
        'required': true,
        'type': String
    },
    'username': {
        'index': true,
        'required': true,
        'type': String
    }
});
exports.User = mongoose.model('user', exports.UserSchema);