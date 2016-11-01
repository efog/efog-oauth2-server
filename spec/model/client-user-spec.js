const ClientUser = require("../../oauth/model/client-user").ClientUser;
const moment = require("moment");
const testClientId = "tstclientid123456";
const testUsername = "tstusername";
const testPassword = "tstpassword";

describe("Client User model", () => {
    beforeAll(() => {
    });
    it("can fetch an non-existent client user by username, password and clientid", (done) => {
        const promise = ClientUser.fetch("abcd123", null, "user123", "password123")
            .then((clientUser) => {
                expect(clientUser).toEqual(null);
            })
            .catch((error) => {
                expect(error.statusCode).toEqual(404);
            });
        promise.finally(done);
    });
    it('can create a client user and fetch by clientid and userkey', (done) => {
        const target = new ClientUser(testClientId, testUsername, null, true, moment().add(10, "year"));
        const saveWithUserkey = (hash) => {
            target.userkey = hash;

            return target.save();
        };
        const fetchByUserkey = (result) => {
            return ClientUser.fetch(target.clientId, target.userkey, null, null);
        };
        const promise = ClientUser.generateUserkey(testClientId, testUsername, testPassword)
            .then(saveWithUserkey)
            .then((result) => {
                expect(result).toBeDefined();
            })
            .then(fetchByUserkey)
            .then((found) => {
                expect(found).toBeDefined();
                expect(found.userkey).toEqual(target.userkey);
                expect(found.clientId).toEqual(target.clientId);
            })
            .catch((error) => {
                console.error(error);
                expect(error).toEqual(null);
            });
        promise.finally(done);
    });
});