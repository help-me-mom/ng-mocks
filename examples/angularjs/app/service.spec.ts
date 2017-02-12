import * as angular from "angular";
import { IRootScopeService } from "angular";
import "angular-mocks";
import { Service } from "./service";

describe("Service", () => {

    let service: Service;
    let $rootScope: IRootScopeService;

    beforeEach(angular.mock.module("app"));

    beforeEach(inject((_service_, _$rootScope_) => {
        service = _service_;
        $rootScope = _$rootScope_;
    }));

    it("should get message", () => {

        service
            .getMessage()
            .then((result) => {
                expect(result).toEqual("Like I promised :)");
            });

        $rootScope.$digest();
    });
});
