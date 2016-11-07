const SwaggerHapi = require('swagger-hapi');
const Crumb = require('crumb');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Path = require('path');
const Logger = require('./tools/logger').Logger;
const RegisterRoute = require('./oauth/routes/register-route').RegisterRoute;
const RegisterClientRoute = require('./oauth/routes/register-client-route').RegisterClientRoute;
const SigninRoute = require('./oauth/routes/signin-route').SigninRoute;
const hapiBunyan = require("hapi-bunyan");
const jwtAuth = require('./oauth/plugins/jwt-auth').jwtAuth;

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
                console.log(`¯\_(ツ)_/¯`);
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

                const jwtAuthConfig = {
                    "register": jwtAuth,
                    "options": {
                        "logger": logger
                    }
                };
                const crumbConfig = {
                    "register": Crumb,
                    "options": {
                        "cookieOptions": {
                            "path": "/",
                            "isSecure": false,
                            "isHttpOnly": true,
                            "encoding": "none",
                            "domain": process.env.APP_NET_DOMAIN
                        }
                    }
                };
                const bunyanConfig = {
                    "register": hapiBunyan,
                    "options": {
                        "logger": logger
                    }
                };
                app.register([jwtAuthConfig, crumbConfig, bunyanConfig, swaggerHapi.plugin], (error) => {
                    if (error) {
                        logger.error(error);
                    }
                });

                app.register(require('vision'), (visionError) => {
                    Hoek.assert(!visionError, visionError);
                    app.views({
                        "engines": {
                            "html": require('handlebars')
                        },
                        "relativeTo": __dirname,
                        "layout": true,
                        "path": Path.join(__dirname, 'oauth', 'pages', 'views'),
                        "layoutPath": Path.join(__dirname, 'oauth', 'pages', 'layout'),
                        "partialsPath": Path.join(__dirname, 'oauth', 'pages', 'partials')
                    });

                    const signinRoute = new SigninRoute();
                    app.route({
                        "method": 'GET',
                        "path": '/signin',
                        "config": {
                            "handler": signinRoute.get
                        }
                    });
                    app.route({
                        "method": 'POST',
                        "path": '/signin',
                        "config": {
                            "handler": signinRoute.post
                        }
                    });

                    const registerRoute = new RegisterRoute();
                    app.route({
                        "method": 'GET',
                        "path": '/register',
                        "config": {
                            "handler": registerRoute.get
                        }
                    });
                    app.route({
                        "method": 'POST',
                        "path": '/register',
                        "config": {
                            "handler": registerRoute.post
                        }
                    });

                    const registerClientRoute = new RegisterClientRoute();
                    app.route({
                        "method": 'GET',
                        "path": '/register-client',
                        "config": {
                            "handler": registerClientRoute.get
                        }
                    });
                    app.route({
                        "method": 'POST',
                        "path": '/register-client',
                        "config": {
                            "handler": registerClientRoute.post
                        }
                    });
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