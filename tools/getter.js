const Promise = require('bluebird');
const https = Promise.promisifyAll(require('https'));

exports.get = function (url) {
    const promise = new Promise((resolve, reject) => {
        let data = [];
        https.get(url, (res) => {

            res.on('data', (received) => {
                data += received;
            });
            res.on('end', () => {
                resolve(data);
            });

        }).on('error', (httpError) => {
            reject(httpError);
        });
    });
    return promise;
};