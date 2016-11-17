const GrantAuditTrace = require('./model/grant-audit-trace').GrantAuditTrace;
const Logger = require('../tools/logger').Logger;

/**
 * Audit trace service
 * 
 * @class AuditService
 */
class AuditService {

    /**
     * Creates an instance of AuditService.
     * 
     * 
     * @memberOf AuditService
     */
    constructor() {
        this._logger = new Logger().logger;
    }

    /**
     * Audits grant request
     * 
     * @param {any} grant request grant definition
     * @param {any} error error generated if any
     * 
     * @returns {promise} execution promise
     * 
     * @memberOf AuditService
     */
    auditGrant(grant, error) {
        const trace = new GrantAuditTrace();
        trace.grantType = grant.grant_type;
        trace.username = grant.username;
        trace.code = grant.code;
        trace.clientId = grant.client_id;
        trace.authorization = grant.authorization;
        trace.success = error === null;
        trace.error = error.message;
        return trace.save().catch((err) => {
            this._logger.error(err.message);
        });
    }
}
exports.AuditService = AuditService;