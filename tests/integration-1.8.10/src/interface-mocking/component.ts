import { ComponentService } from "./component.interface";

export class Component {

    constructor(private componentService: ComponentService) {}

    public sayHello(): string {
        return this.componentService.sayHello();
    }
}
