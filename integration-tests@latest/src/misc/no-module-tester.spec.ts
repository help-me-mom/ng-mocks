class NoModuleComponent {

    public getBuffer(): Buffer {

        return new Buffer("hello");
    }
}

describe("NoModuleComponent", () => {

    it("should use no modules without the bundle loader crashing and burning", () => {

        expect(new NoModuleComponent().getBuffer()).toEqual(new Buffer("hello"));
    });
});
