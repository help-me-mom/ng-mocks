
describe("ModuleComponent", () => {

    it("should have a module.id equal to __filename", () => {

        expect(module.id).toEqual(__filename);
        expect(module.id.indexOf("/src/module/component.spec.ts")).toBeGreaterThan(0);
    });
});
