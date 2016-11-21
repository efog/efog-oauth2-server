const builder = require("botbuilder");

/**
 * Fogg bot registration class
 * 
 * @class bot
 */
class Bot {

    /**
     * Creates an instance of bot.
     * 
     * @memberOf bot
     */
    constructor() {
        this._connector = new builder.ChatConnector({
            "appId": process.env.APPSETTING_APP_BOT_ID,
            "appPassword": process.env.APPSETTING_APP_BOT_KEY
        });
        this._bot = new builder.UniversalBot(this._connector);
        this._bot.dialog("/", this.hello);
    }

    /**
     * Says hello to user
     * 
     * @param {any} session session data
     * @returns {undefined}
     *
     * @memberOf bot
     */
    hello(session) {
        session.send(`Hello World`);
    }

    /**
     * Gets connector instance
     * 
     * @readonly
     * 
     * @memberOf Bot
     */
    get connector() {
        return this._connector;
    }
}

exports.Bot = new Bot();