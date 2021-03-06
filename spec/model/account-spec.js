const Database = require('../../oauth/model/mongo/mongo-database');
const Account = require('../../oauth/model/account').Account;

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
        const targetAccountName = 'account123456';
        const targetApplicationName = 'clientid123456';
        const promise = Account.findByApplicationName(targetAccountName, targetApplicationName)
            .then((result) => {
                expect(result).not.toEqual(null);
                expect(result.clients.length).toEqual(2);
                expect(result.clients[0].applicationName).toEqual(targetApplicationName);
            })
            .catch((error) => {
                console.error(error);
                expect(error).toEqual(null);
            });
        promise.finally(done);
    });
});