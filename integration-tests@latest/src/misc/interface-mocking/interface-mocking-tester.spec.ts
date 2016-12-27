import { IComponentService } from "./component.interface";
import { Component } from "./component";

class MockComponentService implements IComponentService {

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
