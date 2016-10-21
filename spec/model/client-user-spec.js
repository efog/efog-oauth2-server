const ClientUser = require("../../oauth/model/storage/client-user").ClientUser;
const moment = require("moment");
const testClientId = "tstclientid123456";
const testUsername = "tstusername";
const testPassword = "tstpassword";

describe("Client User model", () => {
    beforeAll(() => {
    });
    it("can fetch an non-existent client user by username, password and clientid", (done) => {
        const promise = ClientUser.fetch("abcd123", "user123", "password123")
            .then((clientUser) => {
                expect(clientUser).toEqual(null);
            })
            .catch((error) => {
                expect(error.statusCode).toEqual(404);
            });
        promise.finally(done);
    });
    it('can create a client user', (done) => {
        const target = new ClientUser(testClientId, testUsername, null, true, moment().add(10, "year"));
        const saveWithUserKey = (hash) => {
            target.userkey = hash;

            return target.save();
        };
        const promise = ClientUser.generateUserkey(testClientId, testUsername, testPassword)
            .then(saveWithUserKey)
            .then((result) => {
                expect(result).toBeDefined();
            })
            .catch((error) => {
                console.error(error);
                expect(error).toEqual(null);
            });
        promise.finally(done);
    });
});