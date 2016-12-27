import * as events from "events";
import { CoreModuleComponent } from "./component";

describe("CoreModuleComponent", () => {

    let coreModuleComponent = new CoreModuleComponent();

    it("should use core module assert", () => {

        expect(coreModuleComponent.testAssert()).toEqual(jasmine.any(Function));
    });

    it("should use core module buffer", () => {

        expect(coreModuleComponent.testBuffer()).toEqual(new Buffer("string"));
    });

    it("should use core module console", () => {

        expect(coreModuleComponent.testConsole()).toEqual(jasmine.any(Function));
    });

    it("should use core module constants", () => {

        expect(coreModuleComponent.testConstants()).toEqual(2);
    });

    it("should use core module crypto", () => {

        expect(coreModuleComponent.testCrypto()).toEqual("b45cffe084dd3d20d928bee85e7b0f21");
    });

    it("should use core module domain", () => {

        expect(coreModuleComponent.testDomain()).toEqual(jasmine.any(events.EventEmitter));
    });

   it("should use core module events", () => {

        expect(coreModuleComponent.testEvents()).toEqual(jasmine.any(events.EventEmitter));
    });

    it("should use core module http", () => {

        expect(coreModuleComponent.testHttp()).not.toBeUndefined();
    });

    it("should use core module os", () => {

        expect(coreModuleComponent.testOs()).toEqual("browser");
    });

    it("should use core module util", () => {

        expect(coreModuleComponent.testUtil()).toBeTruthy();
    });
});
