import * as angular from "angular";

export class Service {

    constructor(private $q: angular.IQService) {
    }

    getMessage(): angular.IPromise<string> {

        return this.$q.when("Like I promised :)");
    }
}
