import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive(
  {
    selector: 'base',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class BaseDirective {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public base5117base() {}
}

@Component(
  {
    selector: 'target',
    template: '',
    hostDirectives: [BaseDirective],
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public target5117base() {}
}

describe('issue-5117:base', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      }).compileComponents(),
    );

    it('binds host directives correctly', () => {
      const input = 'input';
      let outputCalled = false;
      const output = () => (outputCalled = true);

      MockRender(TargetComponent, {
        input,
        output,
      });

      // default state
      expect(outputCalled).toEqual(false);

      // inputs and outputs aren't exposed
      const base = ngMocks.findInstance(BaseDirective);
      expect(isMockOf(base, BaseDirective)).toEqual(false); // real
      expect(base.input).toEqual(undefined);
      base.output.emit();
      expect(outputCalled).toEqual(false);
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder([TargetComponent], [BaseDirective]));

    it('binds host directives correctly', () => {
      const input = 'input';
      let outputCalled = false;
      const output = () => (outputCalled = true);

      MockRender(TargetComponent, {
        input,
        output,
      });

      // default state
      expect(outputCalled).toEqual(false);

      // inputs and outputs aren't exposed
      const base = ngMocks.findInstance(BaseDirective);
      expect(isMockOf(base, BaseDirective)).toEqual(true); // mock
      expect(base.input).toEqual(undefined);
      base.output.emit();
      expect(outputCalled).toEqual(false);
    });
  });
});
