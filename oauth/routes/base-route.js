const appHmac = process.env.APP_HMAC_SECRET;
const crypto = require('crypto');
const guid = require('../../tools/guid').guid;

class BaseRoute {
    constructor() {

        /**
         * Gets antiforgery token and returns encrypted value
         * 
         * @param {string} content content to use as anti forgery token
         * @returns {string} encrypted antiforgery token
         */
        this.getAntiForgeryToken = (content) => {
            const antiForgeryToken = `${content}`;
            const cipher = crypto.createCipher('aes192', appHmac);
            const encrypted = cipher.update(antiForgeryToken, 'utf8', 'hex');
            return encrypted;
        };
    }
}
exports.BaseRoute = BaseRoute;