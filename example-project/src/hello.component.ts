import { IHelloService } from "./hello-service.interface";

export class HelloComponent {

    constructor(private helloService: IHelloService) {}

    public sayHello(): string {

        return this.helloService.sayHello();
    }

    public oneliner(): string { let greeting = "Hello, I'm a one line function!"; return greeting; }
}
