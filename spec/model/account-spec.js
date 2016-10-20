const Database = require('../../oauth/model/storage/mongo/mongo-database');
const Account = require('../../oauth/model/storage/account').Account;

/**
 * describe account document schema
 */
describe('account schema', () => {
    beforeAll(() => {
    });
    it('should find account by name', (done) => {
        const targetAccountName = 'account123456';
        const promise = Account.findByName(targetAccountName)
            .then((result) => {
                expect(result.accountName).toEqual(targetAccountName);
                expect(result).not.toEqual(null);
            })
            .catch((error) => {
                expect(error).toEqual(null);
            });
        promise.finally(done);
    });
    it('should find account by client id', (done) => {
        const targetClientId = 'clientid123456';
        const promise = Account.findByClientId(targetClientId)
            .then((result) => {
                expect(result).not.toEqual(null);
                expect(result.clients.length).toEqual(2);
                expect(result.clients[0].clientId).toEqual(targetClientId);
            })
            .catch((error) => {
                console.error(error);
                expect(error).toEqual(null);
            });
        promise.finally(done);
    });
});