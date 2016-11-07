/**
 * Application error subclas
 * 
 * @class ApplicationError
 * @extends {Error}
 */
class ApplicationError extends Error { }
exports.ApplicationError = ApplicationError;

/**
 * Authorization error subclass
 * 
 * @class AuthorizationError
 * @extends {exports.ApplicationError}
 */
class AuthorizationError extends exports.ApplicationError { }
exports.AuthorizationError = AuthorizationError;

/**
 * Client error subclass
 * 
 * @class ClientError
 * @extends {exports.ApplicationError}
 */
class ClientError extends exports.ApplicationError { }
exports.ClientError = ClientError;