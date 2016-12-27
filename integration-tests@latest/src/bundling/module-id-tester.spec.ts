
describe("ModuleComponent", () => {

    it("should have a module.id equal to __filename", () => {

        expect((<any>module).uri).toEqual(__filename);
        expect(module.id).toEqual("src/module/component.spec.ts");
    });
});
