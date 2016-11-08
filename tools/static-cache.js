const Promise = require('bluebird');

/**
 * Static simple cache
 * 
 * @class StaticCache
 */
class StaticCache {

    /**
     * Creates an instance of StaticCache.
     * 
     * 
     * @memberOf StaticCache
     */
    constructor() {
        this._cache = {};

        /**
         * Gets data off the cache and uses fallback promise if not found
         * 
         * @param {object} config contains the caching key and retention strategy
         * @param {object} fallback not found fallback promise
         * 
         * @returns {Promise} an execution promise
         */
        this.fetch = (config, fallback) => {
            const promise = new Promise((resolve, reject) => {
                if (this._cache[config.key]) {
                    const item = this._cache[config.key];
                    this.setExpire(config);
                    return resolve(item.value);
                }
                return fallback()
                    .then((result) => {
                        this._cache[config.key] = {
                            "value": result
                        };
                        this.setExpire(config);
                        return resolve(result);
                    })
                    .catch(reject);
            });
            return promise;
        };

        /**
         * Sets expire flush method on cached item
         * 
         * @param {any} config cached item config
         * @return {undefined}
         */
        this.setExpire = (config) => {
            if (this._cache[config.key] && config.expires) {
                const target = this._cache[config.key];
                const expire = () => {
                    this._cache[config.key] = null;
                };
                if (target.reset) {
                    clearTimeout(target.reset);
                }
                target.reset = config.expires ? setTimeout(expire, config.expires) : null;
            }
        };
    }
}
exports.StaticCache = new StaticCache();