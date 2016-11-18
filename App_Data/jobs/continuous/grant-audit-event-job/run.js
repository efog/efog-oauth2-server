const moment = require('moment');
const Promise = require('bluebird');
const AuditService = require('../../../../oauth/audit-service').AuditService;
const Logger = require('../../../../tools/logger').Logger;

const checkQueue = () => {
    console.log(`## WEBJOB RUN @ ${moment()}`);
    setTimeout(checkQueue, 10000);
};

checkQueue();