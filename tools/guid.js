/**
 * Returns a unique GUID
 * 
 * @returns {string} a random guid
 */
function guid() {

    /**
     * S4 method
     * 
     * @returns {string} S4 string
     */
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
exports.guid = guid;