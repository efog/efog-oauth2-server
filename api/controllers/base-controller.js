/**
 * 
 * 
 * @class BaseController
 */
class BaseController {

    constructor() {

        this.codes = {
            "OK": 200,
            "CREATED": 201,
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
            "INTERNALSERVERERROR": "INTERNALSERVERERROR"
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