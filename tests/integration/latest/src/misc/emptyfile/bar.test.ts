module APP {
    describe("bar", () => {
        let bar = new Bar();

        it("should say bar", () => {
            expect(bar.sayBar()).toBe("bar");
        });
    });
}
