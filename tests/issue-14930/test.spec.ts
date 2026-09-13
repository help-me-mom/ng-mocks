import {
  Component,
  forwardRef,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class RootService {
  public readonly value: string = 'real root';
}

const marker: RootService = { value: 'module provider' };

@NgModule({
  providers: [{ provide: RootService, useValue: marker }],
})
class ProviderModule {}

@Component({
  selector: 'issue-14930-outside',
  standalone: true,
  template: 'outside {{ service.value }}',
})
class OutsideComponent {
  public constructor(public readonly service: RootService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14930
// Like #6143, these standalone cycles require Angular 15.2.4 or later.
// The Angular 15 matrix target uses 15.2.10.
describe('issue-14930', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    ngMocks.globalWipe(RootService);
    ngMocks.defaultMock(RootService);
  });

  for (const scenario of [
    { name: 'cold A', order: ['A'], mock: true },
    { name: 'cold B', order: ['B'], mock: true },
    { name: 'A then B', order: ['A', 'B'], mock: true },
    { name: 'B then A', order: ['B', 'A'], mock: true },
    {
      name: 'A then B with global keep',
      order: ['A', 'B'],
      mock: false,
    },
  ]) {
    it(`preserves the explicit provider from ${scenario.name}`, async () => {
      // Fresh declarations keep cold-order controls independent of other tests.
      @Component({
        selector: 'issue-14930-b',
        standalone: true,
        imports: [forwardRef(() => ComponentA)],
        template: 'B {{ service.value }}',
      })
      class ComponentB {
        public constructor(public readonly service: RootService) {}
      }

      @Component({
        selector: 'issue-14930-a',
        standalone: true,
        imports: [ComponentB, ProviderModule],
        template: 'A {{ service.value }}',
      })
      class ComponentA {
        public constructor(public readonly service: RootService) {}
      }

      if (scenario.mock) {
        ngMocks.globalMock(RootService);
      } else {
        ngMocks.globalKeep(RootService);
      }
      ngMocks.defaultMock(RootService, () => ({
        value: 'global mock',
      }));

      for (const entry of scenario.order) {
        const component = entry === 'A' ? ComponentA : ComponentB;
        await TestBed.configureTestingModule({
          imports: [component],
        }).compileComponents();

        const fixture = TestBed.createComponent(component);
        fixture.detectChanges();

        expect(isMockOf(fixture.componentInstance, component)).toBe(
          false,
        );
        expect(fixture.componentInstance.service).toBe(marker);
        expect(fixture.debugElement.injector.get(RootService)).toBe(
          marker,
        );
        expect(
          isMockOf(fixture.componentInstance.service, RootService),
        ).toBe(false);
        expect(ngMocks.formatText(fixture)).toBe(
          `${entry} module provider`,
        );
        expect(marker.value).toBe('module provider');

        // Keep declaration caches while entering the graph from another root.
        TestBed.resetTestingModule();
      }
    });
  }

  it('applies global policy when the explicit provider module is outside the configured graph', async () => {
    ngMocks.globalMock(RootService);
    ngMocks.defaultMock(RootService, () => ({
      value: 'global mock',
    }));

    await TestBed.configureTestingModule({
      imports: [ProviderModule],
    }).compileComponents();
    expect(TestBed.inject(RootService)).toBe(marker);
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [OutsideComponent],
    }).compileComponents();
    const mocked = TestBed.createComponent(OutsideComponent);
    mocked.detectChanges();

    expect(mocked.componentInstance.service).not.toBe(marker);
    expect(
      isMockOf(mocked.componentInstance.service, RootService),
    ).toBe(true);
    expect(ngMocks.formatText(mocked)).toBe('outside global mock');
    TestBed.resetTestingModule();

    ngMocks.globalKeep(RootService);
    await TestBed.configureTestingModule({
      imports: [OutsideComponent],
    }).compileComponents();
    const kept = TestBed.createComponent(OutsideComponent);
    kept.detectChanges();

    expect(kept.componentInstance.service).not.toBe(marker);
    expect(
      isMockOf(kept.componentInstance.service, RootService),
    ).toBe(false);
    expect(ngMocks.formatText(kept)).toBe('outside real root');
    expect(marker.value).toBe('module provider');
  });
});
