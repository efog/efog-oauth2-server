const exit = require('node-clean-exit');
const moment = require("moment");
const mongoose = require("mongoose");
const Database = require("./../oauth/model/storage/mongo/mongo-database");

/**
 * Runs the cli
 * The format is ./run {resource} {action}
 * 
 * @returns {undefined}
 */
function run() {
    const argv = require('minimist')(process.argv.slice(2));
    const resource = argv._[0];
    const action = argv._[1];
    if (!resource) {
        throw new Error('Target resource not set, usage ex: cli client create');
    }
    if (!action) {
        throw new Error('Target action not set, usage ex: cli client create');
    }

    const command = require(`./commands/${resource}-commands`)[`${action}`];
    if (!command) {
        throw new Error('Command not found');
    }

    return command(argv)
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(-1);
        });
}
run();