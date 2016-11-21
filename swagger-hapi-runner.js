const SwaggerHapi = require('swagger-hapi');
const Crumb = require('crumb');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Path = require('path');
const Logger = require('./tools/logger').Logger;
const RegisterRoute = require('./oauth/routes/register-route').RegisterRoute;
const RegisterClientRoute = require('./oauth/routes/register-client-route').RegisterClientRoute;
const HomeRoute = require('./oauth/routes/home-route').HomeRoute;
const SigninRoute = require('./oauth/routes/signin-route').SigninRoute;
const Bot = require('./bot/bot').Bot;
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
     * Configures web routes
     * 
     * @static
     * @param {any} app HAPIJS app object
     * @returns {undefined}
     * 
     * @memberOf HapiRunner
     */
    static configurePortalRoutes(app) {

        const portalRoutes = app.select('portal');

        const signinRoute = new SigninRoute();
        const registerRoute = new RegisterRoute();
        const registerClientRoute = new RegisterClientRoute();
        const homeRoute = new HomeRoute();

        portalRoutes.route({
            "method": 'GET',
            "path": '/',
            "config": {
                "handler": homeRoute.get
            }
        });
        portalRoutes.route({
            "method": 'GET',
            "path": '/signin',
            "config": {
                "handler": signinRoute.get
            }
        });
        portalRoutes.route({
            "method": 'POST',
            "path": '/signin',
            "config": {
                "handler": signinRoute.post
            }
        });
        portalRoutes.route({
            "method": 'GET',
            "path": '/signout',
            "config": {
                "handler": signinRoute.out
            }
        });
        // portalRoutes.route({
        //     "method": 'GET',
        //     "path": '/register',
        //     "config": {
        //         "handler": registerRoute.get
        //     }
        // });
        // portalRoutes.route({
        //     "method": 'POST',
        //     "path": '/register',
        //     "config": {
        //         "handler": registerRoute.post
        //     }
        // });
        // portalRoutes.route({
        //     "method": 'GET',
        //     "path": '/register-client',
        //     "config": {
        //         "handler": registerClientRoute.get
        //     }
        // });
        // portalRoutes.route({
        //     "method": 'POST',
        //     "path": '/register-client',
        //     "config": {
        //         "handler": registerClientRoute.post
        //     }
        // });
    }

    /**
     * Configures bot routes
     * 
     * @static
     * @param {any} app HAPIJS app object
     * @returns {undefined}
     * 
     * @memberOf HapiRunner
     */
    static configureBotRoutes(app) {
        const botRoutes = app.select('bot');
        botRoutes.route({
            "method": 'POST',
            "path": '/oauth/bot',
            "config": {
                "handler": Bot.connector.listen()
            }
        });
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

    /**
     * Start server
     * 
     * @static
     * @returns {undefined}
     * 
     * @memberOf HapiRunner
     */
    static start() {
        const logger = new Logger().logger;
        const app = new Hapi.Server({});
        const config = {
            "appRoot": __dirname,
            "routes": {
                "cors": true
            }
        };
        const port = process.env.PORT || 2406;

        app.connection({
            "port": port,
            "labels": ['portal', 'bot']
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
                    "domain": process.env.APPSETTING_APP_NET_DOMAIN
                }
            }
        };
        const bunyanConfig = {
            "register": hapiBunyan,
            "options": {
                "logger": logger
            }
        };
        app.register([jwtAuthConfig, crumbConfig, bunyanConfig],
            {
                "select": ['portal']
            },
            (error) => {
                if (error) {
                    logger.error(error);
                }
            }
        );

        // Vision
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
        });

        SwaggerHapi.create(config, function (err, swaggerHapi) {
            if (err) {
                throw new Error(err.message);
            }
            console.log(`¯\_(ツ)_/¯`);
            app.register([swaggerHapi.plugin],
                (error) => {
                    if (error) {
                        logger.error(error);
                    }
                }
            );            
            return app.start(function () {
                console.log(`Server running at port: ${port}`);
            });

        });

        HapiRunner.configureBotRoutes(app);
        HapiRunner.configurePortalRoutes(app);

    }
}
module.exports = HapiRunner;