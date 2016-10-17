const moment = require('moment');
const mongoose = require('mongoose');

/**
 * Define client schema
 */
exports.ClientSchema = new mongoose.Schema({
    'client_id': {
        'index': true,
        'required': true,
        'type': String
    },
    'client_secret': {
        'required': true,
        'type': String
    },
    'creation_date': {
        'default': moment(),
        'required': true,
        'type': Date
    },
    'description': {
        'type': String
    },
    'modification_date': {
        'default': moment(),
        'required': true,
        'type': Date
    },
    'status': {
        'default': 'unconfirmed',
        'enum': ['active', 'inactive', 'unconfirmed'],
        'required': true,
        'type': String
    }
});

/**
 * Gets client by id and secret
 * 
 * @param {string} clientId client identification
 * @param {string} clientSecret client secret identification
 * @param {object} callback return callback
 * @returns {undefined}
 */
exports.ClientSchema.methods.getByIdAndSecret = (clientId, clientSecret, callback) => { 

};
exports.Client = mongoose.model('user', exports.ClientSchema);