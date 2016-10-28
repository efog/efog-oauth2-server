const keypair = require('keypair');
const Promise = require('bluebird');

exports.generate = function () {
    return new Promise((resolve, reject) => {
        const pair = keypair();
        
        console.log(JSON.stringify(pair));

        resolve(pair);
    });
};