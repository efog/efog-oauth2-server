const jwtAuth = {
    "register": function (server, options, next) {

        server.ext('onPostAuth', (request, reply) => {
            return reply.continue();
        });
        next();
    }
};
exports.jwtAuth = jwtAuth;

jwtAuth.register.attributes = {
    "name": 'jwtAuth',
    "version": '1.0.0'
};