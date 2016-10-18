

describe('account schema', () => {
    beforeAll(() => {
        this.Database = require('../../oauth/model/storage/mongo/mongo-database');
    });
    it('should find account by name', () => {
        const Account = require('../../oauth/model/storage/mongo/documents/account').Account;
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