const AuthorizationService = require('../../oauth/authorization-service').AuthorizationService;
const BaseController = require('./base-controller');
const Promise = require('bluebird');
const code = "code";
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
                    if (requestPayload.response_type === code) {
                        return this.codeFlow(req, res, requestPayload)
                            .catch((error) => {
                                if (error instanceof errors.ApplicationError) {
                                    // const redirectUrl = `${requestPayload.redirect_uri}?error=${error.message}&state=${requestPayload.state}`;
                                    // return this.sendRedirect(req, res, redirectUrl);
                                    return this.sendBadRequest(req, res, error.message);
                                }
                                return this.sendInternalServerError(req, res, error.message);
                            });
                    }
                    return this.sendBadRequest(req, res, messages.INVALID_RESPONSE_TYPE);
                })
                .catch((error) => {
                    return this.sendBadRequest(req, res, error.message);
                });
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
            const signinUrl = `${process.env.APPSETTING_APP_SIGN_IN_URL}?response_type=${requestPayload.response_type}&redirect_url=${requestPayload.redirect_uri}&client_id=${requestPayload.client_id}&scope=${requestPayload.scope}&state=${requestPayload.state}`;
            return this.authorizationService.clientAuthorizationRequestIsValid(requestPayload.client_id, requestPayload.redirect_uri, requestPayload.scope)
                .then((client) => {
                    if (req.jwt) {
                        return this.authorizationService.findAccount(req.jwt.body.sub)
                            .then((account) => {
                                if (account.hasApp(requestPayload.client_id)) {
                                    return this.authorizationService.getAuthorizationCode(req.token, client.redirectUrl, client.applicationKey)
                                        .then((authCode) => {
                                            const redirectUrl = `${requestPayload.redirect_uri}?authorization_code=${authCode}&state=${requestPayload.state}`;
                                            return this.sendRedirect(req, res, redirectUrl);
                                        });
                                }
                                return this.sendRedirect(req, res, `${signinUrl}&signin_error=${messages.NO_CLIENT}`);
                            });
                    }
                    return this.sendRedirect(req, res, signinUrl);
                });
        };
    }
}
module.exports = new AuthorizationController();