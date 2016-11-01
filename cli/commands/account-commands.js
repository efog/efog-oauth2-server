const bluebird = require("bluebird");
const crypto = require("crypto");
const moment = require("moment");
const inquirer = require('inquirer');
const Account = require('../../oauth/model/account').Account;

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
 * @param {any} isNew is new resource
 * 
 * @returns {Promise} validation promise
 */
function validateAccountOwnerEmail(input, isNew) {
    const promise = new Promise((resolve, reject) => {
        if (input) {
            const test = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(input);
            if (test) {
                return Account.findByEmail(input).then((found) => {
                    if (isNew) {
                        return resolve(!found);
                    }

                    return resolve(found);
                });
            }

            return resolve(test);
        }

        return resolve(false);
    });

    return promise;
}

/**
 * Create account
 * 
 * @param {any} argv argument object
 * @returns {Promise} an execution promise
 */
function create(argv) {
    const validateAccountOwnerEmailCreate = (input) => {
        return validateAccountOwnerEmail(input, true);
    };
    const validateAccountNameCreate = (input) => {
        return validateAccountName(input, true);
    };

    return new Promise((resolve, reject) => {
        const questions = [];
        if (!argv["account-name"]) {
            questions.push(
                {
                    "type": "input",
                    "name": "accountName",
                    "message": "Enter account name",
                    "validate": validateAccountNameCreate
                });
        }
        if (!argv["account-owner"]) {
            questions.push(
                {
                    "type": "input",
                    "name": "accountOwner",
                    "message": "Enter account owner email",
                    "validate": validateAccountOwnerEmailCreate
                });
        }
        if (!argv["account-password"]) {
            questions.push(
                {
                    "type": "password",
                    "name": "accountPassword",
                    "message": "Enter account password"
                });
        }

        return inquirer.prompt(questions)
            .then(function (answers) {
                return Account.create(answers);
            })
            .then(resolve)
            .catch(reject);
    });
}
exports.create = create;