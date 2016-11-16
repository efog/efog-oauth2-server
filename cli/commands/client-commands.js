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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationName",
                                "message": "Enter application name"
                            });
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationDescription",
                                "message": "Enter application description"
                            });
                        questions.push(
                            {
                                "type": "input",
                                "name": "redirectUri",
                                "message": "Enter redirection url"
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationName = clientAnswers.applicationName;
                        const applicationDescription = clientAnswers.applicationDescription;
                        const redirectUri = clientAnswers.redirectUri;
                        return account.addClient(applicationName, applicationDescription, redirectUri);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.add = add;

/**
 * Add flow to cient
 * 
 * @returns {Promise} execution promise
 */
function addFlow() {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        questions.push(
            {
                "type": "input",
                "name": "accountName",
                "message": "Enter account name"
            });
        questions.push(
            {
                "type": "password",
                "name": "accountPassword",
                "message": "Enter account password"
            });

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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationKey",
                                "message": "Enter application key"
                            });
                        questions.push(
                            {
                                "type": "rawlist",
                                "name": "flow",
                                "message": "Choose flow",
                                "choices": ["code", "token"]
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        const flow = clientAnswers.flow;
                        return account.addFlow(applicationKey, flow);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.addFlow = addFlow;

/**
 * Remove flow to cient
 * 
 * @returns {Promise} execution promise
 */
function removeFlow() {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        questions.push(
            {
                "type": "input",
                "name": "accountName",
                "message": "Enter account name"
            });
        questions.push(
            {
                "type": "password",
                "name": "accountPassword",
                "message": "Enter account password"
            });

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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationKey",
                                "message": "Enter application key"
                            });
                        questions.push(
                            {
                                "type": "rawlist",
                                "name": "flow",
                                "message": "Choose flow",
                                "choices": ["code", "token"]
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        const flow = clientAnswers.flow;
                        return account.removeFlow(applicationKey, flow);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.removeFlow = removeFlow;

/**
 * Remove grant to cient
 * 
 * @returns {Promise} execution promise
 */
function removeGrant() {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        questions.push(
            {
                "type": "input",
                "name": "accountName",
                "message": "Enter account name"
            });
        questions.push(
            {
                "type": "password",
                "name": "accountPassword",
                "message": "Enter account password"
            });

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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationKey",
                                "message": "Enter application key"
                            });
                        questions.push(
                            {
                                "type": "rawlist",
                                "name": "grant",
                                "message": "Choose grant type",
                                "choices": ["password", "authorization-code", "client-credentials"]
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        const grant = clientAnswers.grant;
                        return account.removeGrant(applicationKey, grant);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.removeGrant = removeGrant;

/**
 * Add grant to cient
 * 
 * @returns {Promise} execution promise
 */
function addGrant() {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        questions.push(
            {
                "type": "input",
                "name": "accountName",
                "message": "Enter account name"
            });
        questions.push(
            {
                "type": "password",
                "name": "accountPassword",
                "message": "Enter account password"
            });

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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationKey",
                                "message": "Enter application key"
                            });
                        questions.push(
                            {
                                "type": "rawlist",
                                "name": "grant",
                                "message": "Choose grant type",
                                "choices": ["password", "authorization-code", "client-credentials"]
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        const grant = clientAnswers.grant;
                        return account.addGrant(applicationKey, grant);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.addGrant = addGrant;

/**
 * Add redirect url to cient
 * 
 * @returns {Promise} execution promise
 */
function addRedirect() {
    const promise = new Promise((resolve, reject) => {
        // application name
        // client id to generate
        const questions = [];
        questions.push(
            {
                "type": "input",
                "name": "accountName",
                "message": "Enter account name"
            });
        questions.push(
            {
                "type": "password",
                "name": "accountPassword",
                "message": "Enter account password"
            });

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
                        questions.push(
                            {
                                "type": "input",
                                "name": "applicationKey",
                                "message": "Enter application key"
                            });
                        questions.push(
                            {
                                "type": "input",
                                "name": "redirectUri",
                                "message": "Enter redirection url"
                            });
                        return inquirer.prompt(questions);
                    })
                    .then((clientAnswers) => {
                        const applicationKey = clientAnswers.applicationKey;
                        const redirectUri = clientAnswers.redirectUri;
                        return account.addClientRedirect(applicationKey, redirectUri);
                    })
                    .then(resolve)
                    .catch(reject);
            });
    });
    return promise;
}
exports.addRedirect = addRedirect;