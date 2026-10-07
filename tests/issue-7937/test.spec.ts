import {
  Component,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

// Some runners auto-spy mocked members and some do not, so the test seeds a concrete spy explicitly.
const createSpy = (name: string, value: string): any =>
  typeof jest === 'undefined'
    ? jasmine.createSpy(name).and.returnValue(value)
    : jest.fn().mockReturnValue(value);

@Pipe({
  name: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `hi there ${value}`;
  }
}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
  providers: [TargetPipe],
})
class TargetModule {}

@Component({
  selector: 'target-7937',
  template: '',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    TargetModule,
  ],
})
class TargetComponent {
  public constructor(public readonly targetPipe: TargetPipe) {}

  public echo(): string {
    return this.targetPipe.transform('test');
  }
}

describe('issue-7937', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('lets TestBed.inject configure the pipe used by the component', () => {
    // Before the fix, TestBed.inject returned a seeded mock pipe instance, but Angular injected a
    // different local pipe instance into the component. ng-mocks now replays those seeded overrides
    // onto the local instance and then returns that local instance from future TestBed.inject calls.
    // Older targets expose only TestBed.get, whereas newer ones prefer TestBed.inject.
    const testBed: {
      inject?: (token: typeof TargetPipe) => TargetPipe;
      get?: (token: typeof TargetPipe) => TargetPipe;
    } = TestBed;
    const inject = testBed.inject || testBed.get;
    if (!inject) {
      throw new Error('TestBed injection is unavailable');
    }
    const targetPipe: TargetPipe = inject.call(testBed, TargetPipe);
    const transform = createSpy('targetTransform', 'mock');
    ngMocks.stub(targetPipe, { transform });

    const component =
      TestBed.createComponent(TargetComponent).componentInstance;

    expect(component.targetPipe).not.toBe(targetPipe);
    expect(component.targetPipe.transform).toBe(targetPipe.transform);
    expect(component.echo()).toEqual('mock');
    expect(transform).toHaveBeenCalledWith('test');
    const resolvedInject = testBed.inject || testBed.get;
    if (!resolvedInject) {
      throw new Error('TestBed injection is unavailable');
    }
    expect(resolvedInject.call(testBed, TargetPipe)).toBe(
      component.targetPipe,
    );
  });
});

describe('issue-7937:baseline', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TargetComponent);
  });

  it('uses a different pipe instance than TestBed.inject in Angular itself', () => {
    // This documents the Angular baseline: plain Angular keeps TestBed.inject(TargetPipe) separate
    // from the component-local pipe instance. ng-mocks intentionally bridges that gap for mocks.
    const testBed: {
      inject?: (token: typeof TargetPipe) => TargetPipe;
      get?: (token: typeof TargetPipe) => TargetPipe;
    } = TestBed;
    const inject = testBed.inject || testBed.get;
    if (!inject) {
      throw new Error('TestBed injection is unavailable');
    }
    expect(fixture.componentInstance.targetPipe).not.toBe(
      inject.call(testBed, TargetPipe),
    );
    expect(fixture.componentInstance.echo()).toEqual('hi there test');
  });
});
