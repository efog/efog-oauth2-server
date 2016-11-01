const SwaggerHapi = require('swagger-hapi');
const Hapi = require('hapi');
const Path = require('path');
const Logger = require('./tools/logger').Logger;
const hapiBunyan = require("hapi-bunyan");

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
        const logger = new Logger().logger;
        if (!HapiRunner.server) {

            const app = new Hapi.Server({

            });

            const config = {
                "appRoot": __dirname,
                "routes": {
                    "cors": true
                }
            };

            SwaggerHapi.create(config, function (err, swaggerHapi) {
                if (err) {
                    throw new Error(err.message);
                }
                // ¯\_(ツ)_/¯
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

                // Swagger
                app.register(swaggerHapi.plugin, function (error) {
                    if (error) {
                        throw new Error(error.message);
                    }
                });

                // Bunyan
                const bunyanConfig = {
                    "register": hapiBunyan,
                    "options": {
                        "logger": logger
                    }
                };
                app.register(bunyanConfig, function (bunyanLoggerError) {
                    if (bunyanLoggerError) {
                        throw new Error("Failed to load plugin:", bunyanLoggerError);
                    }
                });

                // Inert
                app.register(require('inert'), (inertError) => {
                    if (inertError) {
                        throw new Error(inertError.message);
                    }
                    app.route({
                        "method": 'GET',
                        "path": '/{param*}',
                        "handler": {
                            "directory": {
                                "path": Path.join(__dirname, 'oauth', 'pages')
                            }
                        }
                    });
                    return app.start(function () {
                        console.log(`Server running at port: ${port}`);
                    });
                });
            });

        }
    }
}
module.exports = HapiRunner;