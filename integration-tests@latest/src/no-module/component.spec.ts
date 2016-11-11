class NoModuleComponent {

    public getBuffer(): Buffer {

        return new Buffer("hello");
    }
}

describe("NoModuleComponent", () => {

    it("should import builtin node modules without the bundler crashing and burning", () => {

        expect(new NoModuleComponent().getBuffer()).toEqual(new Buffer("hello"));
    });
});
