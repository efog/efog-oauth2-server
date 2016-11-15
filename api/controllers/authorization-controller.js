const AuthorizationService = require('../../oauth/authorization-service').AuthorizationService;
const TokenService = require('../../oauth/token-service').TokenService;
const BaseController = require('./base-controller');
const Promise = require('bluebird');
const code = "code";
const token = "token";
const guid = require('../../tools/guid').guid;
const errors = require('../../tools/errors');
const messages = require('../../oauth/messages').Messages;

/**
 * Authorization API Controller
 * 
 * @class AuthorizationController
 * @extends {BaseController}
 */
class AuthorizationController extends BaseController {

    /**
     * Creates an instance of AuthorizationController.
     * 
     * 
     * @memberOf AuthorizationController
     */
    constructor() {
        super();
        this.authorizationService = new AuthorizationService();

        /**
        * Process get action on controller
        * 
        * @param {any} req request content
        * @param {any} res response object
        * 
        * @returns {undefined}
        * 
        * @memberOf AuthorizationController
        */
        this.get = (req, res) => {
            this.setJwtFromRequest(req, res)
                .then(() => {
                    const requestPayload = {
                        "response_type": req.swagger.params.response_type ? req.swagger.params.response_type.value : null,
                        "client_id": req.swagger.params.client_id ? req.swagger.params.client_id.value : null,
                        "state": req.swagger.params.state ? req.swagger.params.state.value : null,
                        "redirect_uri": req.swagger.params.redirect_uri ? req.swagger.params.redirect_uri.value : null,
                        "scope": req.swagger.params.scope ? req.swagger.params.scope.value : null
                    };
                    return this.authorizationService.clientAuthorizationRequestIsValid(requestPayload.client_id, requestPayload.redirect_uri, requestPayload.scope, requestPayload.response_type)
                        .then((clientAccount) => {
                            if (requestPayload.response_type === code) {
                                return this.codeFlow(req, res, requestPayload);
                            }
                            if (requestPayload.response_type === token) {
                                return this.implicitFlow(req, res, requestPayload);
                            }
                            return this.sendBadRequest(req, res, messages.INVALID_RESPONSE_TYPE);
                        })
                        .catch((error) => {
                            if (error instanceof errors.ApplicationError) {
                                // const redirectUri = `${requestPayload.redirect_uri}?error=${error.message}&state=${requestPayload.state}`;
                                // return this.sendRedirect(req, res, redirectUri);
                                return this.sendBadRequest(req, res, error.message);
                            }
                            return this.sendInternalServerError(req, res, error.message);
                        });
                })
                .catch((error) => {
                    return this.sendBadRequest(req, res, error.message);
                });
        };

        /**
         * Process implicit flow
         * 
         * @param {any} req request content
         * @param {any} res response object
         * @param {any} requestPayload request payload
         * @returns {undefined}
         * 
         * @memberOf AuthorizationController
         */
        this.implicitFlow = (req, res, requestPayload) => {
            const signinUrl = `${process.env.APPSETTING_APP_SIGN_IN_URL}?response_type=${requestPayload.response_type}&redirect_uri=${requestPayload.redirect_uri}&client_id=${requestPayload.client_id}&scope=${requestPayload.scope}&state=${requestPayload.state}`;
            if (req.jwt) {
                return this.authorizationService.findAccount(req.jwt.body.sub)
                    .then((account) => {
                        if (account.hasApp(requestPayload.client_id)) {
                            return TokenService.getJwt(account)
                                .then((bearerToken) => {
                                    const redirectUri = `${requestPayload.redirect_uri}?access_token=${bearerToken}&state=${requestPayload.state}`;
                                    return this.sendRedirect(req, res, redirectUri);
                                });
                        }
                        return this.sendRedirect(req, res, `${signinUrl}&signin_error=${messages.NO_CLIENT}`);
                    });
            }
            return this.sendRedirect(req, res, signinUrl);
        };

        /**
         * Process code flow
         * 
         * @param {any} req request content
         * @param {any} res response object
         * @param {any} requestPayload request payload
         * @returns {undefined}
         * 
         * @memberOf AuthorizationController
         */
        this.codeFlow = (req, res, requestPayload) => {
            const signinUrl = `${process.env.APPSETTING_APP_SIGN_IN_URL}?response_type=${requestPayload.response_type}&redirect_uri=${requestPayload.redirect_uri}&client_id=${requestPayload.client_id}&scope=${requestPayload.scope}&state=${requestPayload.state}`;
            if (req.jwt) {
                return this.authorizationService.findAccount(req.jwt.body.sub)
                    .then((account) => {
                        if (account.hasApp(requestPayload.client_id)) {
                            return this.authorizationService.getAuthorizationCode(req.token, requestPayload.redirect_uri, requestPayload.client_id)
                                .then((authCode) => {
                                    const redirectUri = `${requestPayload.redirect_uri}?code=${authCode}&state=${requestPayload.state}`;
                                    return this.sendRedirect(req, res, redirectUri);
                                });
                        }
                        return this.sendRedirect(req, res, `${signinUrl}&signin_error=${messages.NO_CLIENT}`);
                    });
            }
            return this.sendRedirect(req, res, signinUrl);
        };
    }
}
module.exports = new AuthorizationController();