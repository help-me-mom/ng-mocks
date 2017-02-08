import { PerformanceComponent } from "./component";

describe("PerformanceComponent", () => {

    it("should run", () => {

        let performanceComponent = new PerformanceComponent();

        expect(performanceComponent.run()).toEqual("I imported a node_modules module!");
    });
});
