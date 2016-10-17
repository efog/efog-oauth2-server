const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const cors = require('cors');

/**
 * Express API Server
 * 
 * @class Server
 */
class ExpressRunner {

    /**
     * Returns server instance
     * 
     * @static
     */
    static get server() {
        return ExpressRunner._server;
    }

    /**
     * Sets server instance
     * 
     * @param {object} value server instance
     * @static
     */
    static set server(value) {
        ExpressRunner._server = value;
    }
    static start() {
        if (!ExpressRunner.server) {
            // configs
            const port = process.env.PORT || 2406;
            const options = {
                'appRoot': __dirname,
                'name': "Efog OAuth2 server"
            };
            app.use(cors());
            ExpressRunner.server = app;
            SwaggerExpress.create(options, function (err, swaggerExpress) {
                if (err) {
                    throw err;
                }
                // install middleware
                swaggerExpress.register(ExpressRunner.server);
                ExpressRunner.server.listen(port);
            });

        }
    }
}
module.exports = ExpressRunner;



