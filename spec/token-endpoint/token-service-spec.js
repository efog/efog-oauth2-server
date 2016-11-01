const Database = require('../../oauth/model/mongo/mongo-database');
const TokenService = require('../../oauth/token-service').TokenService;
const Promise = require('bluebird');
const publicKeyUrl = process.env.APP_JWT_PUBLIC_KEY_URL;
const njwt = Promise.promisifyAll(require('njwt'));

/**
 * describe account document schema
 */
describe('token service', () => {
    beforeAll(() => {
    });
    it('should get token by account name and password', (done) => {
        const promise = TokenService.getBearerToken("dev", "amee6Huu")
            .then((token) => {
                expect(token).not.toEqual(null);
                expect(token.expires_in).toEqual(24 * 60 * 60);
            })
            .catch((error) => {
                expect(error).toEqual(null);
            })
            .finally(done);
    });
    it('should validate token with public key', (done) => {
        let target = null;
        const promise = TokenService.getBearerToken("dev", "amee6Huu")
            .then((token) => {
                target = token;
                expect(target).not.toEqual(null);
                expect(target.expires_in).toEqual(24 * 60 * 60);
                return TokenService.getPublicKey();
            })
            .then((key) => {
                return njwt.verifyAsync(target.access_token, key, "RS256");
            })
            .then((verified) => {
                expect(verified).not.toEqual(null);
            })
            .catch((error) => {
                expect(error).toEqual(null);
            })
            .finally(done);
    });
    it('should fail getting token by username and wrong password', (done) => {
        const promise = TokenService.getBearerToken("dev", "badpass")
            .then((token) => {
                throw new Error("should not come here");
            })
            .catch((error) => {
                expect(error).not.toEqual(null);
            })
            .finally(done);
    });
});