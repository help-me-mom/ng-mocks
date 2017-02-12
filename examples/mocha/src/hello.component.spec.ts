import { HelloService } from "./hello-service.interface";
import { HelloComponent } from "./hello.component";

class MockHelloService implements HelloService {

    public sayHello(): string {
        return "Hello world!";
    }
}

describe("HelloComponent", () => {

    it("should say 'Hello world!'", () => {

        let mockHelloService = new MockHelloService();
        let helloComponent = new HelloComponent(mockHelloService);

        expect(helloComponent.sayHello()).to.be("Hello world!");
    });
});
