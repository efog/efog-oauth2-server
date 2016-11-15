const BaseController = require('./base-controller');
const errors = require('../../tools/errors');
const tokenEndpoint = require('../../oauth/token-endpoint');
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
        this.tokenEndpoint = new tokenEndpoint.TokenEndpoint();
        Object.defineProperties(this, {
            'post': {
                'value': (req, res) => {
                    const grantType = req.swagger.params.grant_type.value ? changeCase.camel(req.swagger.params.grant_type.value) : null;
                    if (!grantType || !this.tokenEndpoint[grantType]) {
                        return this.sendBadRequest(req, res, messages.INVALID_GRANT_TYPE);
                    }
                    const endpointCallback = (err, result) => {
                        if (err) {
                            if (err instanceof errors.ApplicationError) {
                                return this.sendUnauthorized(req, res, err.message);
                            }
                            return this.sendInternalServerError(req, res, err.message);
                        }
                        return this.sendOk(req, res, result);
                    };
                    return this.tokenEndpoint[grantType](this.makeGrant(req.swagger.params), endpointCallback);
                }
            },
            'makeGrant': {
                'value': (params) => {
                    return {
                        'code': params.code ? params.code.value : null,
                        'username': params.username.value ? params.username.value : null,
                        'password': params.password.value ? params.password.value : null,
                        'scope': params.scope.value ? params.scope.value : null,
                        'client_id': params.client_id ? params.client_id.value : null,
                        'redirect_uri': params.redirect_uri.value ? params.redirect_uri.value : null,
                        'authorization': params.Authorization.value ? params.Authorization.value : null
                    };
                }
            }
        });
    }
}
module.exports = new TokenController();