const moment = require("moment");
const mongoose = require("mongoose");
const crypto = require('crypto');
const guid = require("../../tools/guid").guid;
const messages = require('../messages').Messages;
const errors = require('../../tools/errors');

const validFlows = {
    "code": true,
    "token": true
};

const validGrants = {
    "authorization_code": true,
    "client_credentials": true,
    "password": true
};

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
        "default": new Date(),
        "required": true,
        "type": Date
    },
    "terminationDate": {
        "default": new Date(),
        "required": true,
        "type": Date
    },
    "apps": [
        {
            "applicationKey": {
                "type": String,
                "required": true,
                "index": true
            },
            "enabled": {
                "type": Boolean,
                "default": true,
                "required": true
            },
            "scopes": {
                "type": [String],
                "default": ["account.READ"]
            }
        }
    ],
    "clients": [{
        "applicationSecret": {
            "required": true,
            "type": String
        },
        "applicationName": {
            "type": String,
            "required": true,
            "index": true
        },
        "applicationKey": {
            "type": String,
            "required": true,
            "index": true,
            "default": guid()
        },
        "applicationDescription": {
            "type": String,
            "required": true
        },
        "effectiveDate": {
            "default": new Date(),
            "required": true,
            "type": Date
        },
        "terminationDate": {
            "default": new Date(),
            "required": true,
            "type": Date
        },
        "redirectUri": {
            "type": [String],
            "required": true
        },
        "scopes": {
            "type": [String]
        },
        "policies": {
            "grants": {
                "type": [String],
                "default": ["authorization_code", "client_credentials"],
                "required": false
            },
            "flows": {
                "type": [String],
                "default": ["code"],
                "required": false
            }
        }
    }]
});

/**
 * Creates an account
 * 
 * @param {Object} argv account creation arguments
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.create = (argv) => {
    const promise = new Promise((resolve, reject) => {

        const account = new exports.Account();
        account.accountName = argv.accountName;
        account.accountOwner = argv.accountOwner;
        account.accountManagers = [];
        account.effectiveDate = new Date();
        account.terminationDate = new Date(moment("2099/01/01", "YYYY/MM/DD", true)
            .endOf("year")
            .format());
        account.clients = [];

        return account.generateAccountSecret(argv.accountPassword).then((key) => {
            account.accountSecret = key;

            return account.save()
                .then(resolve)
                .catch(reject);
        });
    });

    return promise;
};

/**
 * Finds account by name
 * 
 * @param {string} name account name
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByName = function (name) {
    const query = {
        "accountName": name,
        "terminationDate": {
            "$gt": new Date()
        },
        "effectiveDate": {
            "$lte": new Date()
        }
    };
    return this.findOne(query);
};

/**
 * Finds account by email
 * 
 * @param {string} email account registered email
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByEmail = function (email) {
    const query = {
        "accountOwner": email,
        "terminationDate": {
            "$gt": new Date()
        },
        "effectiveDate": {
            "$lte": new Date()
        }
    };
    return this.findOne(query);
};

/**
 * Finds account by application name and account name
 * 
 * @param {string} accountName account name
 * @param {string} applicationName application name
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByApplicationName = function (accountName, applicationName) {
    const query = {
        "accountName": accountName,
        "clients.applicationName": applicationName,
        "terminationDate": {
            "$gt": new Date()
        },
        "effectiveDate": {
            "$lte": new Date()
        },
        "clients.terminationDate": {
            "$gt": new Date()
        },
        "clients.effectiveDate": {
            "$lte": new Date()
        }
    };
    return this.findOne(query);
};

/**
 * Finds account by application key
 * 
 * @param {string} applicationKey application name
 * @param {string} redirectUri redirection uri
 * @param {string} scope scope requested
 * @param {string} flow flow requested
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByApplicationKey = function (applicationKey, redirectUri, scope, flow) {
    const query = {
        "clients.applicationKey": applicationKey,
        "terminationDate": {
            "$gt": new Date()
        },
        "effectiveDate": {
            "$lte": new Date()
        },
        "clients.terminationDate": {
            "$gt": new Date()
        },
        "clients.effectiveDate": {
            "$lte": new Date()
        }
    };
    if (redirectUri) {
        query["clients.redirectUri"] = redirectUri;
    }
    if (flow) {
        query["clients.policies.flows"] = flow;
    }
    return this.findOne(query);
};

/**
 * Finds account by application key and application secret
 * 
 * @param {string} applicationKey application name
 * @param {string} applicationSecret application secret
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByApplicationKeyAndSecret = function (applicationKey, applicationSecret) {
    const query = {
        "clients.applicationKey": applicationKey,
        "clients.applicationSecret": applicationSecret,
        "terminationDate": {
            "$gt": new Date()
        },
        "effectiveDate": {
            "$lte": new Date()
        },
        "clients.terminationDate": {
            "$gt": new Date()
        },
        "clients.effectiveDate": {
            "$lte": new Date()
        }
    };
    return this.findOne(query);
};


/**
 * Finds account by name and password
 * 
 * @param {string} accountName account name
 * @param {string} accountPassword account password
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.statics.findByNameAndPassword = function (accountName, accountPassword) {
    let targetAccount = null;
    return exports.Account.findByName(accountName)
        .then((account) => {
            targetAccount = account;
            if (targetAccount) {
                return account.validateOwnership(accountPassword);
            }
            throw new errors.AuthorizationError(messages.NO_ACCOUNT);
        })
        .then((isowner) => {
            if (isowner) {
                return targetAccount;
            }
            throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
        });
};

/**
 * Generate an account secret for instance with password
 * 
 * @param {string} password password to generate key against
 * @returns {Promise} a key generation promise
 */
exports.AccountSchema.methods.generateAccountSecret = function (password) {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APPSETTING_APP_HMAC_SECRET);
        const hash = hmac.update(`${this.accountName}$+++${password}+${this.accountOwner}`).digest('hex');
        resolve(hash);
    });

    return promise;
};

/**
 * Generate an application secret for instance
 * 
 * @param {string} applicationName application name
 * @returns {Promise} a key generation promise
 */
exports.AccountSchema.methods.generateApplicationSecret = function (applicationName) {
    const promise = new Promise((resolve, reject) => {
        const hmac = crypto.createHmac('sha256', process.env.APPSETTING_APP_HMAC_SECRET);
        const hash = hmac.update(`${this.accountName}$+++${this.accountSecret}+${new Date()}`).digest('hex');
        resolve(hash);
    });

    return promise;
};

/**
 * Generate an application key for instance
 * 
 * @param {string} applicationName application name
 * @returns {string} application key
 */
exports.AccountSchema.methods.generateApplicationKey = function (applicationName) {
    const hmac = crypto.createHmac('sha256', process.env.APPSETTING_APP_HMAC_SECRET);
    const hash = hmac.update(`${this.accountName}${applicationName}¯\_(ツ)_/¯${new Date()}`).digest('hex');
    return hash;
};

/**
 * Adds an application to the account
 * 
 * @param {string} applicationKey application key
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.methods.addApplication = function (applicationKey) {
    return exports.Account.findByApplicationKey(applicationKey)
        .then((client) => {
            if (client) {
                let found = false;
                for (let idx = 0; idx < this.apps.length; idx++) {
                    found = this.apps[idx].applicationKey === applicationKey;
                    if (found) {
                        break;
                    }
                }
                if (!found) {
                    this.apps.push({
                        "applicationKey": applicationKey,
                        "scopes": client.scopes
                    });
                }
                return this.save();
            }
            throw new errors.ClientError(messages.INVALID_CLIENT);
        });
};

/**
 * Adds a client to the account
 * 
 * @param {string} applicationName application name
 * @param {string} applicationDescription application description
 * @param {string} redirectUri redirection url
 * 
 * @returns {Promise} an execution promise
 */
exports.AccountSchema.methods.addClient = function (applicationName, applicationDescription, redirectUri) {
    return this.generateApplicationSecret(applicationName)
        .then((secret) => {
            const app = {
                "applicationName": applicationName,
                "applicationSecret": secret,
                "applicationDescription": applicationDescription,
                "applicationKey": this.generateApplicationKey(applicationName),
                "redirectUri": [redirectUri],
                "terminationDate": moment("2099/01/01", "YYYY/MM/DD", true).endOf("year"),
                "scopes": ["*"]
            };
            this.clients.push(app);
            return this.save();
        });
};

/**
 * Add redirect URI to client
 * 
 * @param {string} applicationKey application key identifier
 * @param {string} redirectUri redirection uri
 * 
 * @returns {Promise} execution promise
 * 
 */
exports.AccountSchema.methods.addClientRedirect = function (applicationKey, redirectUri) {
    for (let idx = 0; idx < this.clients.length; idx++) {
        if (this.clients[idx].applicationKey === applicationKey) {
            this.clients[idx].redirectUri.push(redirectUri);
            break;
        }
    }
    return this.save();
};

/**
 * Validates that account instance matches the password
 * 
 * @param {string} password password to validate against
 * @returns {Promise} a promise following ownership validation
 */
exports.AccountSchema.methods.validateOwnership = function (password) {
    const promise = new Promise((resolve, reject) => {
        return this.generateAccountSecret(password)
            .then((key) => {
                if (key === this.accountSecret) {
                    return resolve(true);
                }
                return resolve(false);
            });
    });
    return promise;
};

/**
 * Returns the client with id
 * 
 * @param {string} clientId client identifier
 * @returns {client} client
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.getClient = function (clientId) {
    for (let idx = 0; idx < this.clients.length; idx++) {
        if (this.clients[idx].applicationKey === clientId) {
            return this.clients[idx];
        }
    }
    return null;
};

/**
 * Checks if client has grant.
 * 
 * @param {string} client target application
 * @param {string} grant grant name
 * 
 * @returns {Boolean} has grant
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.clientHasGrant = function (client, grant) {
    if (client.policies && client.policies.grants) {
        for (let idx = 0; idx < client.policies.grants.length; idx++) {
            if (client.policies.grants[idx] === grant) {
                return idx;
            }
        }
    }
    return -1;
};

/**
 * Checks if client has flow.
 * 
 * @param {object} client target application
 * @param {string} flow flow name
 * 
 * @returns {Boolean} has flow
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.clientHasFlow = function (client, flow) {
    if (client.policies && client.policies.flows) {
        for (let idx = 0; idx < client.policies.flows.length; idx++) {
            if (client.policies.flows[idx] === flow) {
                return idx;
            }
        }
    }
    return -1;
};

/**
 * Adds grant type to client policies
 * 
 * @param {string} clientId target application
 * @param {string} grantType grant type
 * 
 * @returns {Promise} execution promise
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.addGrant = function (clientId, grantType) {
    const client = this.getClient(clientId);
    if (validGrants[grantType] && client) {
        client.policies = client.policies ? client.policies : {};
        const policies = client.policies;
        if (policies.grants && this.clientHasGrant(client, grantType) < 0) {
            policies.grants.push(grantType);
        }
        else if (!policies.grants) {
            policies.grants = [grantType];
        }
    }
    return this.save();
};

/**
 * Removes grant from account client policies.
 * 
 * @param {string} clientId target application
 * @param {string} grant grant name
 * 
 * @returns {Promise} execution promise
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.removeGrant = function (clientId, grant) {
    const client = this.getClient(clientId);
    if (validGrants[grant] && client) {
        client.policies = client.policies ? client.policies : {};
        const policies = client.policies;
        const grantIdx = this.clientHasGrant(client, grant);
        if (policies.grants && grantIdx !== -1) {
            policies.grants.splice(grantIdx, 1);
        }
    }
    return this.save();
};

/**
 * Adds flow to account client policies.
 * 
 * @param {string} clientId target application
 * @param {string} flow flow name
 * 
 * @returns {Promise} execution promise
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.addFlow = function (clientId, flow) {
    const client = this.getClient(clientId);
    if (validFlows[flow] && client) {
        client.policies = client.policies ? client.policies : {};
        const policies = client.policies;
        if (policies.flows && this.clientHasFlow(client, flow) < 0) {
            policies.flows.push(flow);
        }
        else if (!policies.flows) {
            policies.flows = [flow];
        }
    }
    return this.save();
};

/**
 * Removes flow from account client policies.
 * 
 * @param {string} clientId target application
 * @param {string} flow flow name
 * 
 * @returns {Promise} execution promise
 * 
 * @memberOf Account
 */
exports.AccountSchema.methods.removeFlow = function (clientId, flow) {
    const client = this.getClient(clientId);
    if (validFlows[flow] && client) {
        client.policies = client.policies ? client.policies : {};
        const policies = client.policies;
        const flowIdx = this.clientHasFlow(client, flow);
        if (policies.flows && flowIdx !== -1) {
            policies.flows.splice(flowIdx, 1);
        }
    }
    return this.save();
};

/**
 * Account has app id
 * 
 * @param {string} applicationKey client identification
 * @returns {boolean} has clientid
 */
exports.AccountSchema.methods.hasApp = function (applicationKey) {
    for (let idx = 0; idx < this.apps.length; idx++) {
        if (this.apps[idx].applicationKey === applicationKey) {
            return true && this.apps[idx].enabled;
        }
    }
    return false;
};

exports.Account = mongoose.model("account", exports.AccountSchema);
