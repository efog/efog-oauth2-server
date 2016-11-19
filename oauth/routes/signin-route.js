const Account = require('../model/account').Account;
const TokenService = require('../token-service').TokenService;
const BaseRoute = require('./base-route').BaseRoute;
const moment = require('moment');
const guid = require('../../tools/guid').guid;
const messages = require('../messages').Messages;
const AuditService = require('../audit-service').AuditService;

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

        this._auditService = new AuditService();

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
                "error": request.query.error ? request.query.error : null,
                "crumb": request.plugins.crumb,
                "client_id": request.query.client_id,
                "redirect_uri": request.query.redirect_uri,
                "response_type": request.query.response_type,
                "state": request.query.state,
                "scope": request.query.scope
            };
            reply.view('signin', viewData);
        };

        /**
         * Handles sign out action
         * 
         * @param {object} request hapijs request object
         * @param {object} reply hapijs reply object
         * 
         * @returns {undefined}
         */
        this.out = (request, reply) => {
            reply.state("jwt_auth", null, {
                "path": "/oauth/authorization",
                "isSecure": false,
                "isHttpOnly": true,
                "encoding": "none",
                "domain": process.env.APPSETTING_APP_NET_DOMAIN
            });
            reply.redirect("/");
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
                "redirect_uri": request.payload.redirect_uri,
                "response_type": request.payload.response_type,
                "state": request.payload.state,
                "scope": request.payload.scope,
                "title": "Sign in"
            };
            const sendBackToSignin = (error) => {
                return reply.redirect(`${viewData.redirect_uri}?error=${error}&scope=${viewData.scope}&state=${viewData.state}`);
                // return reply.redirect(`signin?response_type=${viewData.response_type}&redirect_uri=${viewData.redirect_uri}&client_id=${viewData.client_id}&scope=${viewData.scope}&state=${viewData.state}&error=${error}`);
            };
            let authError = null;
            TokenService.getBearerToken(request.payload.username, request.payload.password, request.payload.client_id)
                .then((token) => {
                    if (viewData.response_type === "code" || viewData.response_type === "token") {
                        reply.state("jwt_auth", token.access_token, {
                            "path": "/oauth/authorization",
                            "isSecure": false,
                            "isHttpOnly": true,
                            "encoding": "none",
                            "domain": process.env.APPSETTING_APP_NET_DOMAIN
                        });
                        return reply.redirect(`/oauth/authorization?response_type=${viewData.response_type}&redirect_uri=${viewData.redirect_uri}&client_id=${viewData.client_id}&scope=${viewData.scope}&state=${viewData.state}`);
                    }
                    // check if user has allowed client_id
                    // offer to add if not
                    return reply.view('signin', viewData);
                })
                .catch((error) => {
                    authError = error;
                    sendBackToSignin(error.message);
                })                
                .finally(() => {
                    const grant = {
                        'code': null,
                        'username': request.payload.username.value ? request.payload.username.value : null,
                        'password': request.payload.value ? request.payload.value : null,
                        'scope': request.payload.scope.value ? request.payload.scope.value : null,
                        'client_id': request.payload.client_id ? request.payload.client_id.value : null,
                        'redirect_uri': request.payload.redirect_uri.value ? request.payload.redirect_uri.value : null,
                        'authorization': null,
                        'grant_type': "password",
                        'origin_address': request.connection.remoteAddress
                    };
                    return this._auditService.pushGrantAuditTrace(grant, authError);
                });
        };

    }
}

exports.SigninRoute = SigninRoute;
