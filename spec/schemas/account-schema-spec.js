const _db = require('../../oauth/model/storage/mongoose-db');
const database = new _db.MongooseDB();

const Account = require('../../oauth/model/documents/account').Account;

describe('account schema', () => {
    beforeAll(() => {
    });
    it('should find account by name', () => {
        Account.findByName('account123456')
            .then((result) => {
                console.log(result);
                expect(result).not.toEqual(null);
            })
            .catch((error) => {
                expect(error).toEqual(null);
            });
    });
});