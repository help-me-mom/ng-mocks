import { NodeGlobalComponent } from "./component";

describe("NodeGlobalComponent", () => {

    it("should return process.cwd()", () => {

        let nodeGlobalComponent = new NodeGlobalComponent();

        expect(nodeGlobalComponent.getCurrentDirectory()).toEqual("/");
    });

    it("should return Buffer", () => {

        let nodeGlobalComponent = new NodeGlobalComponent();

        expect(nodeGlobalComponent.getBuffer()).toEqual(new Buffer("hello"));
    });

    it("should return __filename", () => {

        let nodeGlobalComponent = new NodeGlobalComponent();

        expect(nodeGlobalComponent.getFilename()).toContain("/src/node-globals/component.ts");
    });

    it("should return __dirname", () => {

        let nodeGlobalComponent = new NodeGlobalComponent();

        expect(nodeGlobalComponent.getDirname()).toContain("/src/node-globals");
    });

    it("should return global", () => {

        let nodeGlobalComponent = new NodeGlobalComponent();

        expect(nodeGlobalComponent.getGlobal()).toEqual(global);
    });
});
