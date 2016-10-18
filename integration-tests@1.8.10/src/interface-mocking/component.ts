import { IComponentService } from "./component.interface";

export class Component {

    constructor(private componentService: IComponentService) {}

    public sayHello(): string {

        return this.componentService.sayHello();
    }
}
