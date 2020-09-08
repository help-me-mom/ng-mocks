
describe("ModuleIdTester", () => {

    it("should have a module.id equal to __filename", () => {

        expect((<any>module).uri).toEqual(__filename);
        expect(module.id).toEqual("src/module-id-tester.spec.ts");
    });
});
