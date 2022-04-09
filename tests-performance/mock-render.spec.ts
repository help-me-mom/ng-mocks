/* eslint-disable no-console */

import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name = 'target';
}

@Directive({
  selector: 'target',
})
class TargetDirective {}

@Component({
  selector: 'target',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent, TargetDirective],
  exports: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

describe('performance:MockRender', () => {
  let timeStandard = 0;
  let timeFasterBeforeEach = 0;
  let timeFasterBeforeAll = 0;

  jasmine.getEnv().addReporter({
    jasmineDone: () => {
      console.log('performance:MockRender');
      console.log(`Time standard: ${timeStandard}`);
      console.log(`Time beforeEach: ${timeFasterBeforeEach}`);
      console.log(
        `Ratio standard / beforeEach: ${
          timeStandard / timeFasterBeforeEach
        }`,
      );
      console.log(`Time beforeAll: ${timeFasterBeforeAll}`);
      console.log(
        `Ratio beforeEach / beforeAll: ${
          timeFasterBeforeEach / timeFasterBeforeAll
        }`,
      );
    },
  });

  describe('standard', () => {
    beforeAll(() => (timeStandard = Date.now()));
    afterAll(() => (timeStandard = Date.now() - timeStandard));

    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    for (let i = 0; i < 100; i += 1) {
      it(`#${i}`, () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('target');
      });
    }
  });

  describe('faster:beforeEach', () => {
    ngMocks.faster();

    beforeAll(() => (timeFasterBeforeEach = Date.now()));
    afterAll(
      () =>
        (timeFasterBeforeEach = Date.now() - timeFasterBeforeEach),
    );

    beforeEach(() =>
      MockBuilder([TargetComponent, TargetService], TargetModule),
    );

    for (let i = 0; i < 100; i += 1) {
      it(`#${i}`, () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('target');
      });
    }
  });

  describe('faster:beforeAll', () => {
    ngMocks.faster();

    beforeAll(() => (timeFasterBeforeAll = Date.now()));
    afterAll(
      () => (timeFasterBeforeAll = Date.now() - timeFasterBeforeAll),
    );

    beforeAll(() =>
      MockBuilder([TargetComponent, TargetService], TargetModule),
    );

    for (let i = 0; i < 100; i += 1) {
      it(`#${i}`, () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('target');
      });
    }
  });

  it('ensures that faster is faster', () => {
    // Usually, it is faster, but it is fine if we are down for 25%
    expect(timeStandard / timeFasterBeforeEach).toBeGreaterThan(0.75);

    // beforeEach should be definitely slower than beforeAll
    expect(
      timeFasterBeforeEach / timeFasterBeforeAll,
    ).toBeGreaterThan(0.75);
  });
});
