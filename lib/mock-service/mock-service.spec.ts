import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockedServiceInstance, MockService } from './mock-service';
import { NumbersService } from './test-services/numbers.service';
import { StringsService } from './test-services/strings.service';

describe('MockService', () => {
  describe('when service does not require deps in constructor', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockService(NumbersService),
        ]
      });
    });

    it('should allow to mock service', () => {
      const service: NumbersService = TestBed.get(NumbersService);
      spyOn(service, 'getNumbers').and.returnValue(of([1]));

      service.getNumbers().subscribe((result) => {
        expect(result).toEqual([1]);
      });
    });
  });

  describe('when service requires deps in constructor', () => {
    beforeEach(() => {
      const http = MockedServiceInstance(HttpClient);
      spyOn(http, 'get').and.returnValue(of(['other']));

      TestBed.configureTestingModule({
        providers: [
          MockService(StringsService, [http]),
        ]
      });
    });

    it('should allow to mock service', () => {
      const service: StringsService = TestBed.get(StringsService);
      spyOn(service, 'getStrings').and.returnValue(of(['test']));

      service.getStrings().subscribe((result) => {
        expect(result).toEqual(['test']);
      });
    });
  });
});
