const mongoose = require('mongoose');

/**
 * Mongoose database 
 * 
 * @class MongooseDB
 */
class MongooseDB {

    /**
     * Creates an instance of MongooseDB.
     * 
     */
    constructor() {
        if (!MongooseDB._connected) {
            const dbUrl = process.env.DBURL || 'mongodb://localhost:27017/efog-oauth2';
            console.log(`MongoDB connecting through mongoose driver at ${dbUrl}`);
            mongoose.connect(dbUrl, function(err) {
                MongooseDB._connected = !err;
                if (MongooseDB._connected) {
                    console.log(`MongoDB connected through mongoose driver at ${dbUrl}`);
                }
            });
        }
    }
}
MongooseDB._connected = false;
exports.MongooseDB = MongooseDB;