const SwaggerRestify = require('swagger-restify-mw');
const restify = require('restify');

/**
 * Restify API Server
 * 
 * @class Server
 */
class RestifyRunner {

    /**
     * Returns server instance
     * 
     * @static
     */
    static get server() {
        return RestifyRunner._server;
    }

    /**
     * Sets server instance
     * 
     * @param {object} value server instance
     * @static
     */
    static set server(value) {
        RestifyRunner._server = value;
    }
    static start() {
        if (!RestifyRunner.server) {
            // configs
            const port = process.env.PORT || 2406;
            const options = {
                'appRoot': __dirname,
                'name': "Efog OAuth2 server"
            };

            RestifyRunner.server = restify.createServer();

            RestifyRunner.server.use(RestifyRunner.crossOrigin);
            RestifyRunner.server.use(restify.bodyParser());
            RestifyRunner.server.use(restify.requestLogger());

            SwaggerRestify.create(options, function (err, swaggerRestify) {
                if (err) {
                    throw err;
                }

                swaggerRestify.register(RestifyRunner.server);
                RestifyRunner.server.listen(port);
            });
        }
    }

    /**
     * Configure le serveur pour supporter les appels d"origine externe
     *
     * @param {any} req objet de requête
     * @param {any} res objet de réponse
     * @param {any} next méthode suivante dans le pipeline
     * @returns {undefined}
     */
    static crossOrigin(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        return next();
    }
}
module.exports = RestifyRunner;



