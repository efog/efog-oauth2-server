const ClientUser = require("../../oauth/model/storage/client-user").ClientUser;

describe("Client User model", () => {
    it("can fetch an non-existent client user by username, password and clientid", (done) => {
        const target = new ClientUser();

        const promise = ClientUser.fetch("abcd123", "user123", "password123").then((clientUser) => {
            expect(clientUser).toEqual(null);
        })
            .catch((error) => {
                expect(error.statusCode).toEqual(404);
            });
        promise.finally(done);
    });
});