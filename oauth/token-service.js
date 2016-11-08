const messages = require('./messages').Messages;
const Account = require('./model/account').Account;
const Promise = require('bluebird');
const moment = require('moment');
const getter = require('../tools/getter');
const ul = require('../tools/urload');
const njwt = require('njwt');
const errors = require('../tools/errors');
const StaticCache = require('../tools/static-cache').StaticCache;
const privateKeyUrl = ul.urload(process.env.APP_JWT_PRIVATE_KEY_URL);
const publicKeyUrl = ul.urload(process.env.APP_JWT_PUBLIC_KEY_URL);

/**
 * Token helper server
 * 
 * @class TokenService
 */
class TokenService {

}

/**
 * Gets JWT for account
 * 
 * @param {string} account account object
 * @returns {object} JWT object 
 */
function getJwt(account) {
    const promise = new Promise((resolve, reject) => {
        const issuer = process.env.APP_JWT_ISSUER;
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
}

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
 * @returns {object} JWT object 
 */
TokenService.getBearerToken = function (accountName, accountPassword, clientId) {
    return new Promise((resolve, reject) => {
        let targetAccount = null;
        return Account.findByNameAndPassword(accountName, accountPassword)
            .then((account) => {
                if (!account) {
                    throw new errors.ApplicationError(messages.NO_ACCOUNT);
                }
                if (clientId && !account.hasClient(clientId)) {
                    throw new errors.ApplicationError(messages.NO_CLIENT);
                }
                targetAccount = account;
                return getJwt(account);
            })
            .then((token) => {
                const accessToken = {
                    "access_token": token,
                    "token_type": "Bearer",
                    "expires_in": 24 * 60 * 60
                };
                return resolve(accessToken);
            })
            .catch(reject);
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