/**
 * Application error subclass
 * 
 * @class ApplicationError
 * @extends {Error}
 */
class ApplicationError extends Error { }
exports.ApplicationError = ApplicationError;

/**
 * System error subclass
 * 
 * @class SystemError
 * @extends {exports.ApplicationError}
 */
class SystemError extends Error { }
exports.SystemError = SystemError;

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