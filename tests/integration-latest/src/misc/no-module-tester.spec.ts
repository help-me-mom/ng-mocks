class NoModuleTester {

    public getBuffer(): Buffer {

        return new Buffer("hello");
    }
}

describe("NoModuleTester", () => {

    it("should use no modules", () => {

        expect(new NoModuleTester().getBuffer()).toEqual(new Buffer("hello"));
    });
});
