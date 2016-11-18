const atob = require('atob');
const btoa = require('btoa');
const messages = require('./messages').Messages;
const Account = require('./model/account').Account;
const AuthorizationCode = require('./model/authorization-code').AuthorizationCode;
const Promise = require('bluebird');
const moment = require('moment');
const getter = require('../tools/getter');
const ul = require('../tools/urload');
const njwt = require('njwt');
const errors = require('../tools/errors');
const StaticCache = require('../tools/static-cache').StaticCache;
const privateKeyUrl = ul.urload(process.env.APPSETTING_APP_JWT_PRIVATE_KEY_URL);
const publicKeyUrl = ul.urload(process.env.APPSETTING_APP_JWT_PUBLIC_KEY_URL);

/**
 * Token helper server
 * 
 * @class TokenService
 */
class TokenService {

}


/**
 * Authenticates application credentials
 * 
 * @param {any} grant grant request details
 * @returns {Promise} execution promise
 * 
 * @memberOf TokenEndpoint
 */
TokenService.authenticateClientCredentials = (grant) => {
    const authInfo = TokenService.getBasicAuthInfo(grant.authorization);
    return Account.findByApplicationKeyAndSecret(authInfo.name, authInfo.password);
};

/**
 * Gets basic auth name and password components
 * 
 * @param {any} authorization basic authorization value
 * 
 * @returns {any} basic authorization components
 */
TokenService.getBasicAuthInfo = (authorization) => {
    const basicAuthRegex = new RegExp(/^Basic /g);
    const idPasswordRegex = new RegExp(/:/g);
    if (!basicAuthRegex.test(authorization)) {
        throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
    }
    const basicAuth = atob(authorization.split(' ')[1]);
    if (!idPasswordRegex.test(basicAuth)) {
        throw new errors.AuthorizationError(messages.INVALID_CREDENTIALS);
    }
    return {
        "name": basicAuth.split(':')[0],
        "password": basicAuth.split(':')[1]
    };
};

/**
 * Gets JWT for account
 * 
 * @param {string} account account object
 * @returns {object} JWT object 
 */
TokenService.getJwt = (account) => {
    const promise = new Promise((resolve, reject) => {
        const issuer = process.env.APPSETTING_APP_JWT_ISSUER;
        if (!issuer || !publicKeyUrl) {
            throw new errors.ApplicationError(messages.ENV_ERROR);
        }
        const claims = {
            "iss": issuer,
            "sub": account.accountName,
            "scope": "self"
        };
        TokenService.getPrivateKey()
            .then((privateKey) => {
                const token = njwt.create(claims, privateKey, "RS256");
                const compact = token.compact();
                return resolve(compact);
            })
            .catch(reject);
    });
    return promise;
};

/**
 * Verifies the token against corresponding private key
 * 
 * @param {string} token compact token to verify
 * @returns {object} unpacked token
 */
TokenService.verifyJwt = function (token) {
    const promise = new Promise((resolve, reject) => {
        TokenService.getPublicKey()
            .then((publicKey) => {
                const unpacked = njwt.verify(token, publicKey, "RS256");
                return resolve(unpacked);
            })
            .catch(reject);

    });
    return promise;
};

/**
 * Gets bearer token
 * 
 * @param {string} accountName account name
 * @param {string} accountPassword account password
 * @param {string} clientId target client id
 * @returns {Promise} execution promise
 * 
 * @memberOf TokenService
 */
TokenService.getBearerToken = function (accountName, accountPassword, clientId) {
    let targetAccount = null;
    return Account.findByNameAndPassword(accountName, accountPassword)
        .then((account) => {
            if (!account) {
                throw new errors.ApplicationError(messages.NO_ACCOUNT);
            }
            if (clientId && !account.hasApp(clientId)) {
                throw new errors.ApplicationError(messages.NO_CLIENT);
            }
            targetAccount = account;
            return TokenService.getJwt(account);
        })
        .then((token) => {
            const accessToken = {
                "access_token": token,
                "token_type": "Bearer"
            };
            return accessToken;
        });
};

/**
 * Returns a bearer token from authorization code
 * 
 * @param {object} grant grant request object
 * @returns {Promise} execution promise
 */
TokenService.getBearerTokenFromCode = function (grant) {
    let code = null;
    return AuthorizationCode.fromCode(grant)
        .then((authCode) => {
            if (!authCode) {
                throw new errors.AuthorizationError(messages.INVALID_CODE);
            }
            code = authCode;
            return AuthorizationCode.delete(authCode.code);
        })
        .then(() => {
            return {
                "access_token": code.token,
                "token_type": "Bearer"
            };
        });
};

/**
 * Gets private key from storage
 * 
 * @returns {string} private key
 */
TokenService.getPrivateKey = function () {
    const action = () => {
        return getter.get(privateKeyUrl);
    };
    const config = {
        "key": privateKeyUrl,
        "expires": 20000
    };
    return StaticCache.fetch(config, action);
};

/**
 * Gets public key from storage
 * 
 * @returns {string} public key
 */
TokenService.getPublicKey = function () {
    const action = () => {
        return getter.get(publicKeyUrl);
    };
    const config = {
        "key": publicKeyUrl,
        "expires": 20000
    };
    return StaticCache.fetch(config, action);
};

exports.TokenService = TokenService;