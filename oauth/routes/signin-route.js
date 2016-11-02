const TokenService = require('../token-service').TokenService;
const BaseRoute = require('./base-route').BaseRoute;
const moment = require('moment');
const guid = require('../../tools/guid').guid;

const INVALID_USERNAME_PASSWORD = "INVALID_USERNAME_PASSWORD";

/**
 * Sign in route
 * 
 * @class SigninRoute
 * @extends {BaseRoute}
 */
class SigninRoute extends BaseRoute {

    /**
     * Creates an instance of SigninRoute.
     * 
     * 
     * @memberOf SigninRoute
     */
    constructor() {
        super();

        /**
         * Handles GET on signin route
         * 
         * @param {object} request hapijs request object
         * @param {object} reply hapijs reply object
         * 
         * @returns {undefined}
         */
        this.get = (request, reply) => {
            const viewData = {
                "signin_error": request.query.signin_error ? INVALID_USERNAME_PASSWORD : null,
                "crumb": request.plugins.crumb,
                "client_id": request.query.client_id,
                "redirect_url": request.query.redirect_url,
                "response_type": request.query.response_type,
                "state": request.query.state,
                "scope": request.query.scope
            };
            reply.view('signin', viewData);
        };

        /**
         * Handles POST on signin route
         * 
         * @param {object} request hapijs request object
         * @param {object} reply hapijs reply object
         * 
         * @returns {undefined}
         */
        this.post = (request, reply) => {
            const viewData = {
                "client_id": request.payload.client_id,
                "redirect_url": request.payload.redirect_url,
                "response_type": request.payload.response_type,
                "state": request.payload.state,
                "scope": request.payload.scope
            };
            TokenService.getBearerToken(request.payload.username, request.payload.password)
                .then((account) => {
                    // check if user has allowed client_id
                    // offer to add if not
                    // redirect to oauth/authorization with parameters when response_type = code
                    reply.view('signin', viewData);
                })
                .catch((error) => {
                    reply.redirect(`signin?response_type=${viewData.response_type}&redirect_url=${viewData.redirect_url}&client_id=${viewData.client_id}&scope=${viewData.scope}&state=${viewData.state}&signin_error=1`);
                });
        };

    }
}

exports.SigninRoute = SigninRoute;
