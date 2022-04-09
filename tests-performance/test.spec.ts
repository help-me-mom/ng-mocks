/* eslint-disable no-console */

import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

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

describe('performance', () => {
  let timeStandard = 0;
  let timeFaster = 0;

  jasmine.getEnv().addReporter({
    jasmineDone: () => {
      console.log('performance');
      console.log(`Time standard: ${timeStandard}`);
      console.log(`Time faster: ${timeFaster}`);
      console.log(
        `Ratio standard / faster: ${timeStandard / timeFaster}`,
      );
    },
  });

  describe('standard', () => {
    beforeAll(() => (timeStandard = Date.now()));
    afterAll(() => (timeStandard = Date.now() - timeStandard));

    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent, TargetDirective],
        providers: [TargetService],
      }).compileComponents(),
    );

    for (let i = 0; i < 100; i += 1) {
      it(`#${i}`, () => {
        const fixture = TestBed.createComponent(TargetComponent);
        fixture.detectChanges();
        expect(ngMocks.formatText(fixture)).toEqual('target');
      });
    }
  });

  describe('faster', () => {
    ngMocks.faster();

    beforeAll(() => (timeFaster = Date.now()));
    afterAll(() => (timeFaster = Date.now() - timeFaster));

    const factory = MockRenderFactory(TargetComponent);
    beforeAll(() =>
      MockBuilder([TargetComponent, TargetService], TargetModule),
    );
    beforeAll(factory.configureTestBed);

    for (let i = 0; i < 100; i += 1) {
      it(`#${i}`, () => {
        const fixture = factory();
        expect(ngMocks.formatText(fixture)).toEqual('target');
      });
    }
  });

  it('ensures that faster is faster', () => {
    // Usually, it is faster, but it is fine if we are down for 25%
    expect(timeStandard / timeFaster).toBeGreaterThan(0.75);
  });
});
