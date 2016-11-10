const BaseController = require('./base-controller');
const tokenEndpoint = require('../../oauth/token-endpoint');
const messages = require('../../oauth/messages').Messages;
const changeCase = require('change-case');

const PASSWORD = 'password';
const CODE = 'authorizationCode';


/**
 * Token controller class
 * 
 * @class TokenController
 */
class TokenController extends BaseController {

    // btoa ZWU1YjAwMjZkMWVkYzE4YTJjN2ZhMDQ1YjQ1ZDY3OGNmMjAwZmNlZTE3MjkzODQ1ZmNmM2ZjYjg3NDU1NDk0ZDplMWJlZTlkMmM4ZmQ5MTk0MzUyNGEyYTczNmNiYWNmYmMyMGNkMzg5MzAzNDJjZjQ2OWVmOGE4MTUxMThlOWE5

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
                            if (err.message === messages.INVALID_CREDENTIALS) {
                                return this.sendUnauthorized(req, res, err.message);
                            }
                            return this.sendInternalServerError(req, res, err.message);
                        }
                        return this.sendOk(req, res, result);
                    };
                    return this.tokenEndpoint[grantType](this.makeGrant(grantType, req.swagger.params), endpointCallback);
                }
            },
            'makeGrant': {
                'value': (grantType, params) => {
                    switch (grantType) {
                    case PASSWORD:
                        return {
                            'username': params.username.value ? params.username.value : null,
                            'password': params.password.value ? params.password.value : null,
                            'scope': params.scope.value ? params.scope.value : null,
                            'client_id': params.client_id ? params.client_id.value : null
                        };
                    case CODE:
                        return {
                            'code': params.code ? params.code.value : null,
                            'redirect_uri': params.redirect_url.value ? params.redirect_url.value : null,
                            'client_id': params.client_id.value ? params.client_id.value : null,
                            'authorization': params.Authorization.value ? params.Authorization.value : null
                        };
                    default:
                        throw new Error(messages.INVALID_GRANT_TYPE);
                    }
                }
            }
        });
    }
}
module.exports = new TokenController();