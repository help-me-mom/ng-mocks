import * as angular from "angular";

export class Service {

    constructor(private $q: angular.IQService) {
    }

    public getMessage(): angular.IPromise<string> {
        return this.$q.when("Like I promised :)");
    }
}
