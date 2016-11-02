const Account = require('../model/account').Account;
const TokenService = require('../token-service').TokenService;
const BaseRoute = require('./base-route').BaseRoute;
const moment = require('moment');
const guid = require('../../tools/guid').guid;

const INVALID_USERNAME_PASSWORD = "INVALID_USERNAME_PASSWORD";
const INVALID_CLIENT = "INVALID_CLIENT";

/**
 * Register route
 * 
 * @class RegisterRoute
 * @extends {BaseRoute}
 */
class RegisterRoute extends BaseRoute {

    /**
     * Creates an instance of RegisterRoute.
     * 
     * 
     * @memberOf RegisterRoute
     */
    constructor() {
        super();

        /**
         * Handles GET on register route
         * 
         * @param {object} request hapijs request object
         * @param {object} reply hapijs reply object
         * 
         * @returns {undefined}
         */
        this.get = (request, reply) => {
            reply.view('register');
        };

        /**
         * Handles POST on register route
         * 
         * @param {object} request hapijs request object
         * @param {object} reply hapijs reply object
         * 
         * @returns {undefined}
         */
        this.post = (request, reply) => {
            reply.view('register');
        };

    }
}

exports.RegisterRoute = RegisterRoute;
