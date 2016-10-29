const btoa = require('btoa');
const atob = require('atob');
exports.urload = function (data) {
    const regexp = new RegExp('^http', 'i');
    if (regexp.test(data)) {
        return data;
    }
    return atob(data);
};
exports.daolru = function (data) {
    const regexp = new RegExp('^http', 'i');
    if (!regexp.test(data)) {
        return data;
    }
    return btoa(data);
};