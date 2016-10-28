const bluebird = require("bluebird");
const crypto = require("crypto");
const moment = require("moment");
const inquirer = require('inquirer');
const TokenService = require('../../oauth/token-service').TokenService;

/**
 * Gets a Token command
 * 
 * @param {any} argv comand arguments
 * @returns {Promise} an execution promise
 */
function get(argv) {
    return new Promise((resolve, reject) => {
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
        return inquirer.prompt(questions)
            .then(function (answers) {
                return TokenService.getBearerToken(answers.accountName, answers.accountPassword);
            })
            .then((token) => {
                console.log(JSON.stringify(token));
                return resolve(token);
            })
            .catch(reject);
    });
}
exports.get = get;