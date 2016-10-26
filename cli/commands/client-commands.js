const bluebird = require("bluebird");
const crypto = require("crypto");
const moment = require("moment");
const inquirer = require('inquirer');
const Account = require('../../oauth/model/storage/account').Account;
const hmac = crypto.createHmac('sha256', process.env.APP_HMAC_SECRET);

/**
 * Validate account name
 * 
 * @param {any} input question input
 * @param {any} isNew is new resource
 * @returns {Promise} validation promise
 */
function validateAccountName(input, isNew) {
    const promise = new Promise((resolve, reject) => {
        if (input) {
            return Account.findByName(input).then((found) => {
                if (isNew) {
                    return resolve(!found);
                }

                return resolve(found);
            });
        }

        return resolve(false);
    });

    return promise;
}

/**
 * Validate account email
 * 
 * @param {any} input question input
 * 
 * @returns {Promise} validation promise
 */
function validateAccountOwnerEmail(input) {
    const promise = new Promise((resolve, reject) => {
        if (input) {
            const test = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(input);

            return resolve(test);
        }

        return resolve(false);
    });

    return promise;
}

/**
 * Create client
 * 
 * @param {any} argv argument object
 * @returns {Promise} an execution promise
 */
function create(argv) {
    return new Promise((resolve, reject) => {
        const questions = [];
        if (!argv["account-name"]) {
            questions.push(
                {
                    "type": "input",
                    "name": "accountName",
                    "message": "Enter account name",
                    "validate": validateAccountName
                });
        }
        if (!argv["account-owner"]) {
            questions.push(
                {
                    "type": "input",
                    "name": "accountOwner",
                    "message": "Enter account owner email",
                    "validate": validateAccountOwnerEmail
                });
        }
        
        return inquirer.prompt(questions)
            .then(function (answers) {
                return Account.create(answers).then(resolve);
            })
            .catch(reject);
    });
}
exports.create = create;