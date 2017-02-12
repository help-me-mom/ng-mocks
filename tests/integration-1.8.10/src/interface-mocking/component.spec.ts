import { Component } from "./component";
import { ComponentService } from "./component.interface";

class MockComponentService implements ComponentService {

    public sayHello(): string {
        return "Hello world!";
    }
}

describe("Component", () => {

    it("should say 'Hello world!'", () => {

        let mockComponentService = new MockComponentService();
        let component = new Component(mockComponentService);

        expect(component.sayHello()).toEqual("Hello world!");
    });
});
