const bluebird = require("bluebird");
const crypto = require("crypto");
const moment = require("moment");
const inquirer = require('inquirer');
const Account = require('../../oauth/model/account').Account;

/**
 * Add a client to an account
 * 
 * @param {object} argv command arguments
 * @returns {undefined}
 */
function add(argv) {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        if (!argv["account-name"]) {
            questions.push(
                {
                    "type": "input",
                    "name": "accountName",
                    "message": "Enter account name"
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

        inquirer.prompt(questions)
            .then(function (answers) {
                let account = null;
                Account.findByName(answers.accountName)
                    .then((found) => {
                        account = found;
                        if (!account) {
                            throw new Error("Account not found");
                        }
                        return account.validateOwnership(answers.accountPassword);
                    })
                    .then((isOwner) => {
                        questions.length = 0;
                        if (!argv["application-key"]) {
                            questions.push(
                                {
                                    "type": "input",
                                    "name": "applicationKey",
                                    "message": "Enter application key"
                                });
                        }
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        return account.addApplication(applicationKey);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.add = add;