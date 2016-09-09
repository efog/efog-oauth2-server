const express = require('express');
const SwaggerExpress = require('swagger-express-mw');

/**
 * Express base server runner
 * 
 * @class ExpressRunner
 */
class ExpressRunner {
    constructor(configuration) {
        this.configuration = configuration;

        /**
         * Starts server
         * 
         * @param {function} callback start callback
         * @returns {undefined}
         */
        const start = (callback) => {
            if (!ExpressRunner._app) {
                SwaggerExpress.create(this.configuration, (err, swagger) => {
                    if (err) {
                        throw err;
                    }
                    const app = express();
                    ExpressRunner._app = app;
                    swagger.register(app);
                    app.listen(this.configuration.port, callback);
                });
            }
        };
        Object.defineProperties(this, {
            "start": {
                "value": start
            }
        });
    }
}
ExpressRunner._app = null;
exports.ExpressRunner = ExpressRunner;