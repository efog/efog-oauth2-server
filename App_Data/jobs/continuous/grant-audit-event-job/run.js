const Database = require('../../../../oauth/model/mongo/mongo-database');
const moment = require('moment');
const Promise = require('bluebird');
const AuditService = require('../../../../oauth/audit-service').AuditService;
const Logger = require('../../../../tools/logger').Logger;
const azure = Promise.promisifyAll(require('azure-storage'));

/**
 * Grant audit trace webjob runner
 * 
 * @class GrantAuditTraceJobRunner
 */
class GrantAuditTraceJobRunner {

    /**
     * Creates an instance of GrantAuditTraceJobRunner.
     * 
     * 
     * @memberOf GrantAuditTraceJobRunner
     */
    constructor() {

        this._queueName = "granttraces";
        this._accountName = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_NAME;
        this._accountKey = process.env.APPSETTING_APP_AZURE_STORAGE_ACCOUNT_KEY;
        this._logger = new Logger().logger;
        this._auditService = new AuditService();

        Object.defineProperties(this, {
            "queueService": {
                "get": () => {
                    const promise = new Promise((resolve, reject) => {
                        if (!this._service) {
                            this._service = azure.createQueueService(this._accountName, this._accountKey);
                        }
                        return resolve(this._service);
                    });
                    return promise;
                }
            }
        });

        /**
         * Checks queue
         * 
         * @returns {undefined}
         */
        this.checkQueue = () => {
            let queueService = null;
            let messages = null;
            return this.queueService
                .then((service) => {
                    queueService = service;
                    return queueService.createQueueIfNotExistsAsync(this._queueName);
                })
                .then(() => {
                    return queueService.getMessagesAsync(this._queueName);
                })
                .then((serverMessages) => {
                    messages = serverMessages;
                    this._logger.debug(`Received messages (${messages.length}) on queue ${this._queueName} at ${moment()}`);
                    const processes = [];
                    for (let idx = 0; idx < messages.length; idx++) {
                        const message = messages[idx];
                        this._logger.debug(`Message: (${message})`);
                        if (message.dequeuecount >= 5) {
                            processes.push(queueService.deleteMessageAsync(this._queueName, message.messageid, message.popreceipt, null));
                        }
                        else {
                            processes.push(
                                this._auditService.processGrantAuditTrace(message)
                                    .then((processed) => {
                                        if (processed) {
                                            return queueService.deleteMessageAsync(this._queueName, processed.messageid, processed.popreceipt, null);
                                        }
                                        return message;
                                    })
                            );
                        }
                    }
                    return Promise.all(processes);
                })
                .catch((error) => {
                    this._logger.error(error.message);
                })
                .finally(() => {
                    if (messages.length) {
                        setImmediate(this.checkQueue);
                    }
                    else {
                        setTimeout(this.checkQueue, 5000);
                    }
                });
        };
    }
}
const runner = new GrantAuditTraceJobRunner();
runner.checkQueue();