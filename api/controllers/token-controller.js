const BaseController = require('./base-controller');
const tokenEndpoint = require('../../oauth/token-endpoint');

const PASSWORD = 'password';
const INVALID_GRANT_TYPE = 'INVALID_GRANT_TYPE';

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
                    const grantType = req.swagger.params.grant_type ? req.swagger.params.grant_type.value : null;
                    if (!grantType || !this.tokenEndpoint[grantType]) {
                        return this.sendBadRequest(req, res, INVALID_GRANT_TYPE);
                    }
                    const endpointCallback = (err, result) => {
                        if (err) {
                            return this.sendInternalServerError(req, res, err);
                        }
                        
                        return this.sendOk(req, res, 'OK');
                    };

                    return this.tokenEndpoint[grantType](this.makeGrant(grantType, req.swagger.params), endpointCallback);
                }
            },
            'makeGrant': {
                'value': (grantType, params) => {
                    switch (grantType) {
                    case PASSWORD:
                        return { 
                            'username': params.username ? params.username.value : null,
                            'password': params.password ? params.password.value : null,
                            'scope': params.scope ? params.scope.value : null,
                            'client_id': params.client_id ? params.client_id.value : null,
                            'client_hash': params.client_hash ? params.client_hash.value : null
                        };

                    default:
                        return {};
                    }
                }
            }
        });
    }
}
module.exports = new TokenController();