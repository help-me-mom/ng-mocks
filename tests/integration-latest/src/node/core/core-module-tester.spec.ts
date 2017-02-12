import * as events from "events";
import { CoreModuleTester } from "./core-module-tester";

describe("CoreModuleComponent", () => {

    let tester = new CoreModuleTester();

    it("should use core module assert", () => {

        expect(tester.testAssert()).toEqual(jasmine.any(Function));
    });

    it("should use core module buffer", () => {

        expect(tester.testBuffer()).toEqual(new Buffer("string"));
    });

    it("should use core module console", () => {

        expect(tester.testConsole()).toEqual(jasmine.any(Function));
    });

    it("should use core module constants", () => {

        expect(tester.testConstants()).toEqual(2);
    });

    it("should use core module crypto", () => {

        expect(tester.testCrypto()).toEqual("b45cffe084dd3d20d928bee85e7b0f21");
    });

    it("should use core module domain", () => {

        expect(tester.testDomain()).toEqual(jasmine.any(events.EventEmitter));
    });

    it("should use core module events", () => {

        expect(tester.testEvents()).toEqual(jasmine.any(events.EventEmitter));
    });

    it("should use core module http", () => {

        expect(tester.testHttp()).not.toBeUndefined();
    });

    it("should use core module os", () => {

        expect(tester.testOs()).toEqual("browser");
    });

    it("should use core module util", () => {

        expect(tester.testUtil()).toBeTruthy();
    });
});
