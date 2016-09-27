import { IHelloService } from "./hello-service.interface";
import { HelloComponent } from "./hello.component";

class MockHelloService implements IHelloService {

    public sayHello(): string {
        return "Hello world!";
    }
}

describe("HelloComponent", () => {

    it("should say 'Hello world!'", () => {

        let mockHelloService = new MockHelloService();
        let helloComponent = new HelloComponent(mockHelloService);

        expect(helloComponent.sayHello()).toEqual("Hello world!");
    });

    it("should keep formatting when run through the ast parser", () => {

        let mockHelloService = new MockHelloService();
        let helloComponent = new HelloComponent(mockHelloService);

        expect(helloComponent.oneliner()).toEqual("Hello, I'm a one line function!");
    });
});
