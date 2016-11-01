const AuthorizationService = require('../../oauth/authorization-service').AuthorizationService;
const BaseController = require('./base-controller');
const Promise = require('bluebird');
const code = "code";
const guid = require('../../tools/guid').guid;

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
            const requestPayload = {
                "response_type": req.swagger.params.response_type ? req.swagger.params.response_type.value : null,
                "client_id": req.swagger.params.client_id ? req.swagger.params.client_id.value : null,
                "state": req.swagger.params.state ? req.swagger.params.state.value : null,
                "redirect_uri": req.swagger.params.redirect_uri ? req.swagger.params.redirect_uri.value : null,
                "scope": req.swagger.params.scope ? req.swagger.params.scope.value : null
            };
            if (requestPayload.response_type === code) {
                return this.codeFlow(requestPayload)
                    .then((result) => {
                        const antiForgeryToken = this.setAntiForgeryTokenCookie(res);
                        const signinUrl = `${process.env.APP_SIGN_IN_URL}?aft=${antiForgeryToken}&response_type=${requestPayload.response_type}&redirect_url=${requestPayload.redirect_uri}&client_id=${requestPayload.client_id}&scope=${requestPayload.scope}&state=${requestPayload.state}`;

                        this.sendRedirect(req, res, signinUrl);
                    })
                    .catch((error) => {
                        if (error.message.startsWith('40')) {
                            return this.sendBadRequest(req, res, error.message);
                        }
                        return this.sendInternalServerError(req, res, error);
                    });
            }
            return this.sendNotFound(req, res);
        };

        /**
         * Process code flow
         * 
         * @param {any} requestPayload request payload
         * @returns {undefined}
         * 
         * @memberOf AuthorizationController
         */
        this.codeFlow = (requestPayload) => {
            const promise = new Promise((resolve, reject) => {
                
                this.authorizationService.clientAuthorizationRequestIsValid(requestPayload.client_id, requestPayload.redirect_uri, requestPayload.scope)
                    .then((client) => {
                        return resolve(client);
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            });
            return promise;
        };
    }
}
module.exports = new AuthorizationController();