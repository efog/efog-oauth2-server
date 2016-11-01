const cookie = require('cookie');
const crypto = require('crypto');
const appHmac = process.env.APP_HMAC_SECRET;
const guid = require('../../tools/guid').guid;

/**
 * 
 * 
 * @class BaseController
 */
class BaseController {

    constructor() {

        this._pendingCookies = [];
        this.codes = {
            "OK": 200,
            "CREATED": 201,
            "REDIRECT": 302,
            "BADREQUEST": 400,
            "UNAUTHORIZED": 401,
            "FORBIDDEN": 403,
            "NOTFOUND": 404,
            "CONFLICT": 409,
            "INTERNALSERVERERROR": 500
        };
        this.messages = {
            "OK": "OK",
            "CREATED": "CREATED",
            "BADREQUEST": "BADREQUEST",
            "UNAUTHORIZED": "UNAUTHORIZED",
            "FORBIDDEN": "FORBIDDEN",
            "NOTFOUND": "NOTFOUND",
            "INTERNALSERVERERROR": "INTERNALSERVERERROR",
            "REDIRECT": "REDIRECT"
        };

        /**
         * Set cookie in headers
         * 
         * @param {object} res response http object
         * @param {string} name cookie name
         * @param {string} value cookie value
         * 
         * @returns {undefined}
         */
        this.setCookie = (res, name, value) => {
            res.setHeader('Set-Cookie', cookie.serialize(name, value, {
                "path": "/",
                "httpOnly": false,
                "maxAge": 60 * 60 * 24 * 7
            }));
        };

        /**
         * Sets antiforgery token cookie and returns encrypted value
         * 
         * @param {object} res response http object
         * @returns {string} encrypted antiforgery token
         */
        this.setAntiForgeryTokenCookie = (res) => {
            const antiForgeryToken = guid();
            const cipher = crypto.createCipher('aes192', appHmac);
            const encrypted = cipher.update(antiForgeryToken, 'utf8', 'hex');
            res.setHeader('Set-Cookie', cookie.serialize("aft", encrypted, {
                "path": "/",
                "httpOnly": false
            }));
            return encrypted;
        };

        /**
         * Send response
         * 
         * @param {any} res response object
         * @param {any} code response code
         * @param {any} data data to return to client
         * 
         * @returns {undefined}
         */
        this.send = (res, code, data) => {
            // ExpressJS style
            if (res.send) {
                res.send(code, data);
            }
            else {
                res.statusCode = `${code}`;
                res.end(data);
            }
        };

        /**
         * Send redirect response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} url target url
         * 
         * @returns {undefined}
         */
        this.sendRedirect = (req, res, url) => {
            res.setHeader('Location', url);
            return this.send(res, this.codes.REDIRECT, url);
        };

        /**
         * Send not found response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * 
         * @returns {undefined}
         */
        this.sendNotFound = (req, res) => {
            return this.send(res, 404,
                {
                    "message": this.messages.NOTFOUND
                });
        };

        /**
         * Send forbidden response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * 
         * @returns {undefined}
         */
        this.sendForbidden = (req, res) => {
            return this.send(res, this.codes.FORBIDDEN,
                {
                    "message": this.messages.FORBIDDEN
                });
        };

        /**
         * Send unauthorized response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * 
         * @returns {undefined}
         */
        this.sendUnauthorized = (req, res) => {
            return this.send(res, this.codes.UNAUTHORIZED,
                {
                    "message": this.messages.UNAUTHORIZED
                });
        };

        /**
         * Send conflict response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} data data to send to client
         * 
         * @returns {undefined}
         */
        this.sendConflict = (req, res, data) => {
            return this.send(res, this.codes.CONFLICT, data ? data
                : {
                    "message": this.messages.CONFLICT
                });
        };

        /**
         * Send resource created response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} data data to send to client
         * 
         * @returns {undefined}
         */
        this.sendResourceCreated = (req, res, data) => {
            return this.send(res, this.codes.CREATED, data ? data
                : {
                    "message": this.messages.CREATED
                });
        };

        /**
         * Send bad request response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} data data to send to client
         * 
         * @returns {undefined}
         */
        this.sendBadRequest = (req, res, data) => {
            return this.send(res, this.codes.BADREQUEST, data ? data
                : {
                    "message": this.messages.BADREQUEST
                });
        };

        /**
         * Send internal server error response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} data data to send to client
         * 
         * @returns {undefined}
         */
        this.sendInternalServerError = (req, res, data) => {
            return this.send(res, this.codes.INTERNALSERVERERROR, data ? data
                : {
                    "message": this.messages.BADREQUEST
                });
        };

        /**
         * Send ok response
         * 
         * @param {any} req request object
         * @param {any} res response object
         * @param {any} data data to send to client
         * 
         * @returns {undefined}
         */
        this.sendOk = (req, res, data) => {
            return this.send(res, 200, data ? data
                : {
                    "message": this.messages.OK
                });
        };
    }
}

module.exports = BaseController;