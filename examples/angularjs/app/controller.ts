import { Service } from "./service";

export class Controller {

    constructor(private service: Service) { }

    public getMessage(): angular.IPromise<string> {

        return this.service.getMessage();
    };
}
