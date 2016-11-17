const BaseController = require('./base-controller');
const AuditService = require('../../oauth/audit-service').AuditService;
const TokenEndpoint = require('../../oauth/token-endpoint').TokenEndpoint;

const errors = require('../../tools/errors');
const messages = require('../../oauth/messages').Messages;
const changeCase = require('change-case');

const PASSWORD = 'password';
const CODE = 'authorizationCode';
const CLIENT_CREDENTIALS = 'clientCredentials';

/**
 * Token controller class
 * 
 * @class TokenController
 */
class TokenController extends BaseController {

    /**
     * Creates an instance of TokenController.
     * @constructor
     */
    constructor() {
        super();
        this._tokenEndpoint = new TokenEndpoint();
        this._auditService = new AuditService();


        /**
         * Handles post request on controller
         * 
         * @param {any} req http request object
         * @param {any} res http response object
         * @returns {undefined}
         * 
         * @memberOf TokenController
         */
        this.post = (req, res) => {
            const grantType = req.swagger.params.grant_type.value ? changeCase.camel(req.swagger.params.grant_type.value) : null;
            if (!grantType || !this._tokenEndpoint[grantType]) {
                return this.sendBadRequest(req, res, messages.INVALID_GRANT_TYPE);
            }
            const grant = this.makeGrant(req.swagger.params);
            const endpointCallback = (err, result) => {
                // this._auditService.auditGrant(grant, err);
                if (err) {
                    if (err instanceof errors.ApplicationError) {
                        return this.sendUnauthorized(req, res, err.message);
                    }
                    return this.sendInternalServerError(req, res, err.message);
                }
                return this.sendOk(req, res, result);
            };
            return this._tokenEndpoint[grantType](grant, endpointCallback);
        };

        /**
         * Constructs grant request object
         * 
         * @param {any} params request parameters
         * @returns {object} a grant request object
         * 
         * @memberOf TokenController
         */
        this.makeGrant = (params) => {
            return {
                'code': params.code ? params.code.value : null,
                'username': params.username.value ? params.username.value : null,
                'password': params.password.value ? params.password.value : null,
                'scope': params.scope.value ? params.scope.value : null,
                'client_id': params.client_id ? params.client_id.value : null,
                'redirect_uri': params.redirect_uri.value ? params.redirect_uri.value : null,
                'authorization': params.Authorization.value ? params.Authorization.value : null,
                'grant_type': params.grant_type.value ? params.grant_type.value : null
            };
        };
    }
}
module.exports = new TokenController();