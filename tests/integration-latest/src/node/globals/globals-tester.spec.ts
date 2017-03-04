import { GlobalsTester } from "./globals-tester";

describe("GlobalsTester", () => {

    let tester = new GlobalsTester();

    it("should return Buffer", () => {

        expect(tester.testBuffer()).toEqual(new Buffer("hello"));
    });

    it("should return __filename", () => {

        expect(tester.testFilename()).toContain("/src/node/globals/globals-tester.ts");
    });

    it("should return __dirname", () => {

        expect(tester.testDirname()).toContain("/src/node/globals");
    });

    it("should return global", () => {

        expect(tester.testGlobal()).toEqual(global);
    });

    it("should test process", () => {

        expect(tester.testProcess()).toEqual("/");
    });
});
