// tslint:disable-next-line:no-namespace
// tslint:disable-next-line:no-internal-module
module APP {
    describe("bar", () => {
        let bar = new Bar();

        it("should say bar", () => {
            expect(bar.sayBar()).toBe("bar");
        });
    });
}
