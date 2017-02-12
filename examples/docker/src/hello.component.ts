import { HelloService } from "./hello-service.interface";

export class HelloComponent {

    constructor(private helloService: HelloService) {}

    public sayHello(): string {

        return this.helloService.sayHello();
    }
}
