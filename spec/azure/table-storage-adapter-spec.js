const TableStorageAdapter = require("../../oauth/model/storage/azure/table-storage-adapter").TableStorageAdapter;

describe("Azure table storage adapter", () => {
    it("should be able to get table from Azure", (done) => {
        const target = new TableStorageAdapter();

        const promise = target.table("tablestorageadapterspectest").then((table) => {
            expect(table).toBeDefined();
        })
            .catch((error) => {
                expect(error).toEqual(null);
                console.error(error);
            });
        promise.finally(done);
    });
});