const BaseRoute = require('./base-route').BaseRoute;

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
                "client_id": request.query.client_id,
                "redirect_url": request.query.redirect_url,
                "response_type": request.query.response_type,
                "state": request.query.state,
                "scope": request.query.scope
            };
            const afToken = this.getAntiForgeryToken(`${viewData.redirect_url}+-+${viewData.client_id}`);
            viewData.aft = afToken;
            reply.view('signin', viewData).state('aft', afToken);
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
                "aft": request.payload.aft
            };
            reply.view('signin', viewData);
        };
    }
}

exports.SigninRoute = SigninRoute;
