const express = require('express');
const app = express();

/**
 * Express base server runner
 * 
 * @class ExpressRunner
 */
class ExpressRunner {
    constructor(configuration) {
        this.configuration = configuration;

        /**
         * Starts server
         * 
         * @returns {undefined}
         */
        const start = () => { };
        Object.defineProperties(this, {
            "start": {
                "value": start
            }
        });
    }
}
exports.ExpressRunner = ExpressRunner;