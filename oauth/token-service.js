const Account = require('./model/storage/account').Account;
const Promise = require('bluebird');
const moment = require('moment');
const getter = require('../tools/getter');
const njwt = require('njwt');
const privateKeyUrl = process.env.APP_JWT_PRIVATE_KEY_URL;
const publicKeyUrl = process.env.APP_JWT_PUBLIC_KEY_URL;

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
 * @param {string} accountName account name
 * @returns {object} JWT object 
 */
function getJwt(accountName) {
    const promise = new Promise((resolve, reject) => {
        const issuer = process.env.APP_JWT_ISSUER;
        if (!issuer || !privateKeyUrl) {
            throw new Error("JWT ENV ERROR");
        }
        const claims = {
            "iss": issuer,
            "sub": accountName,
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
 * Gets bearer token
 * 
 * @param {string} accountName account name
 * @param {string} accountPassword account password
 * @returns {object} JWT object 
 */
TokenService.getBearerToken = function (accountName, accountPassword) {
    return new Promise((resolve, reject) => {
        return Account.findByNameAndPassword(accountName, accountPassword)
            .then((account) => {
                if (account) {
                    return getJwt(accountName);
                }
                throw new Error('401: ACCOUNT NOT FOUND');
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
    return getter.get(privateKeyUrl);
};

/**
 * Gets public key from storage
 * 
 * @returns {string} public key
 */
TokenService.getPublicKey = function () {
    return getter.get(publicKeyUrl);
};

exports.TokenService = TokenService;