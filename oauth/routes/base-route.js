const appHmac = process.env.APP_HMAC_SECRET;
const crypto = require('crypto');
const guid = require('../../tools/guid').guid;

class BaseRoute {
    constructor() {
        this.route = "";
    }
}
exports.BaseRoute = BaseRoute;