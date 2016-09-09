const expressRunner = require("./runners/express-runner");

/**
 * Configuration
 */
const config = {
    "port": process.env.PORT || 2406
};

const runner = new expressRunner.ExpressRunner(config);
runner.start(() => {
    console.log(`Running on port ${config.port}`);
});
