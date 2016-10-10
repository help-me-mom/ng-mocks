import { IHelloService } from "./hello-service.interface";

export class HelloComponent {

    constructor(private helloService: IHelloService) {}

    public sayHello(): string {

        return this.helloService.sayHello();
    }

    /*
    public log(y) {

        let x;

        return y;

        console.log(x);
    }
    //*/
}
