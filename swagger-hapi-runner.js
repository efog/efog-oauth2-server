const SwaggerHapi = require('swagger-hapi');
const Hapi = require('hapi');

/**
 * HAPI API Server
 * 
 * @class Server
 */
class HapiRunner {

    /**
     * Returns server instance
     * 
     * @static
     */
    static get server() {
        return HapiRunner._server;
    }

    /**
     * Sets server instance
     * 
     * @param {object} value server instance
     * @static
     */
    static set server(value) {
        HapiRunner._server = value;
    }
    static start() {
        if (!HapiRunner.server) {

            const app = new Hapi.Server();
            const config = {
                "appRoot": __dirname,
                "cors": true
            };

            SwaggerHapi.create(config, function (err, swaggerHapi) {
                HapiRunner.server = swaggerHapi;
                const port = process.env.PORT || 2406;
                app.connection({
                    "port": port
                });
                app.address = function () {
                    return {
                        "port": port
                    };
                };

                app.register(swaggerHapi.plugin, function (error) {
                    if (err) {
                        return console.error('Failed to load plugin:', error);
                    }

                    return app.start(function () {
                        console.log(`Server running at port: ${port}`);
                    });
                });
            });

        }
    }
}
module.exports = HapiRunner;