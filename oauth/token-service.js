const Account = require('./model/storage/account').Account;
const Promise = require('bluebird');
const https = Promise.promisifyAll(require('https'));
const moment = require('moment');
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
TokenService.getBearerToken = function (accountName, accountPassword) {
    return new Promise((resolve, reject) => {

        return Account.findByNameAndPassword(accountName, accountPassword)
            .then((account) => {
                if (account) {
                    return TokenService.getJwt(accountName);
                }
                return reject();
            })
            .then((token) => {
                const accessToken = {
                    "access_token": token,
                    "token_type": "Bearer",
                    "expires_in": moment().add(24, 'hour')
                };
                return resolve(accessToken);
            })
            .catch(reject);
    });
};
TokenService.getJwt = function (accountName) {
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
};

TokenService.getPrivateKey = function () {
    const promise = new Promise((resolve, reject) => {
        let data = [];
        https.get(privateKeyUrl, (res) => {

            res.on('data', (received) => {
                data += received;
            });
            res.on('end', () => {
                resolve(data);
            });

        }).on('error', (httpError) => {
            reject(httpError);
        });
    });
    return promise;
};

exports.TokenService = TokenService;