import {
  Component,
  Directive,
  Input,
  isStandalone,
  Pipe,
  PipeTransform,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'child-14932',
  template: 'child:{{ value }} <ng-content></ng-content>',
})
class ChildComponent {
  @Input() public value = '';
}

@Directive({ selector: '[directive14932]' })
class DependencyDirective {
  @Input() public value = '';

  public read(): string {
    return `directive:${this.value}`;
  }
}

@Pipe({ name: 'pipe14932' })
class DependencyPipe implements PipeTransform {
  public transform(value: string): string {
    return `pipe:${value}`;
  }
}

@Component({
  imports: [ChildComponent, DependencyDirective, DependencyPipe],
  template: `
    <child-14932 [value]="value">
      <b>projected:{{ value }}</b>
    </child-14932>
    <span directive14932 [value]="value"></span>
    <p>{{ value | pipe14932 }}</p>
  `,
})
class HostComponent {
  @Input() public value = 'initial';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14932
// These application declarations intentionally omit standalone: Angular 19+ supplies true.
describe('issue-14932', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => {
    expect(
      (
        ChildComponent as typeof ChildComponent & {
          ɵcmp: { standalone: boolean };
        }
      ).ɵcmp.standalone,
    ).toBe(true);
    expect(
      (
        DependencyDirective as typeof DependencyDirective & {
          ɵdir: { standalone: boolean };
        }
      ).ɵdir.standalone,
    ).toBe(true);
    expect(
      (
        DependencyPipe as typeof DependencyPipe & {
          ɵpipe: { standalone: boolean };
        }
      ).ɵpipe.standalone,
    ).toBe(true);
    expect(
      (
        HostComponent as typeof HostComponent & {
          ɵcmp: { standalone: boolean };
        }
      ).ɵcmp.standalone,
    ).toBe(true);
  });

  for (const mocked of [false, true]) {
    it(`renders omitted-default declarations through ${mocked ? 'mocked' : 'real'} imports`, async () => {
      if (mocked) {
        await MockBuilder(HostComponent).mock(
          DependencyPipe,
          (value: string) => `mock:${value}`,
        );
      } else {
        await TestBed.configureTestingModule({
          imports: [HostComponent],
        }).compileComponents();
      }

      const fixture = MockRender(HostComponent, { value: 'initial' });
      const component = ngMocks.findInstance(ChildComponent);
      const directive = ngMocks.findInstance(DependencyDirective);
      const pipe = ngMocks.findInstance(DependencyPipe);

      expect(
        isMockOf(fixture.point.componentInstance, HostComponent),
      ).toBe(false);
      expect(
        isStandalone(
          fixture.point.componentInstance
            .constructor as Type<unknown>,
        ),
      ).toBe(true);
      expect(isMockOf(component, ChildComponent)).toBe(mocked);
      expect(isMockOf(directive, DependencyDirective)).toBe(mocked);
      expect(isMockOf(pipe, DependencyPipe)).toBe(mocked);
      expect(
        isStandalone(component.constructor as Type<unknown>),
      ).toBe(true);
      expect(
        isStandalone(directive.constructor as Type<unknown>),
      ).toBe(true);
      expect(isStandalone(pipe.constructor as Type<unknown>)).toBe(
        true,
      );
      expect(isStandalone(fixture.componentRef.componentType)).toBe(
        false,
      );
      expect(component.value).toBe('initial');
      expect(directive.value).toBe('initial');
      if (mocked) {
        expect(directive.read()).toBeUndefined();
      } else {
        expect(directive.read()).toBe('directive:initial');
      }
      expect(ngMocks.formatText(fixture)).toBe(
        mocked
          ? 'projected:initialmock:initial'
          : 'child:initial projected:initialpipe:initial',
      );

      fixture.componentInstance.value = 'updated';
      fixture.detectChanges();

      expect(fixture.point.componentInstance.value).toBe('updated');
      expect(component.value).toBe('updated');
      expect(directive.value).toBe('updated');
      if (mocked) {
        expect(directive.read()).toBeUndefined();
      } else {
        expect(directive.read()).toBe('directive:updated');
      }
      expect(ngMocks.formatText(fixture)).toBe(
        mocked
          ? 'projected:updatedmock:updated'
          : 'child:updated projected:updatedpipe:updated',
      );
    });
  }

  it('keeps the empty render wrapper nonstandalone', async () => {
    await MockBuilder();

    const fixture = MockRender();

    expect(isStandalone(fixture.componentRef.componentType)).toBe(
      false,
    );
    expect(ngMocks.formatText(fixture)).toBe('');
  });

  it('renders real omitted-default imports through a nonstandalone custom wrapper', async () => {
    await MockBuilder([
      ChildComponent,
      DependencyDirective,
      DependencyPipe,
    ]);

    const fixture = MockRender(
      `
        <child-14932 [value]="value"></child-14932>
        <span directive14932 [value]="value"></span>
        <p>{{ value | pipe14932 }}</p>
      `,
      { value: 'custom' },
    );
    const component = ngMocks.findInstance(ChildComponent);
    const directive = ngMocks.findInstance(DependencyDirective);
    const pipe = ngMocks.findInstance(DependencyPipe);

    expect(isStandalone(fixture.componentRef.componentType)).toBe(
      false,
    );
    expect(isMockOf(component, ChildComponent)).toBe(false);
    expect(isMockOf(directive, DependencyDirective)).toBe(false);
    expect(isMockOf(pipe, DependencyPipe)).toBe(false);
    expect(component.value).toBe('custom');
    expect(directive.value).toBe('custom');
    expect(ngMocks.formatText(fixture)).toBe(
      'child:custom pipe:custom',
    );
  });
});
