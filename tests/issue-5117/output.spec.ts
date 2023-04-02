import {
  Component,
  Directive,
  EventEmitter,
  Output,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive(
  {
    selector: 'output',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class OutputDirective {
  @Output() public readonly output = new EventEmitter<void>();

  public output25117output() {}
}

@Component(
  {
    selector: 'target',
    template: '',
    hostDirectives: [
      {
        directive: OutputDirective,
        outputs: ['output: customOutput'],
      },
    ],
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  @Output() public readonly output = new EventEmitter<void>();

  public target5117output() {}
}

describe('issue-5117:output', () => {
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
      let outputCalled = false;
      const output = () => (outputCalled = true);
      let customOutputCalled = false;
      const customOutput = () => (customOutputCalled = true);

      MockRender(TargetComponent, {
        output,
        customOutput,
      });

      // default state
      expect(outputCalled).toEqual(false);
      expect(customOutputCalled).toEqual(false);

      // outputs are exposed
      const outputDirective = ngMocks.findInstance(OutputDirective);
      expect(isMockOf(outputDirective, OutputDirective)).toEqual(
        false,
      ); // real
      outputDirective.output.emit();
      expect(customOutputCalled).toEqual(true);
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder([TargetComponent], [OutputDirective]),
    );

    it('binds host directives correctly', () => {
      let outputCalled = false;
      const output = () => (outputCalled = true);
      let customOutputCalled = false;
      const customOutput = () => (customOutputCalled = true);

      MockRender(TargetComponent, {
        output,
        customOutput,
      });

      // default state
      expect(outputCalled).toEqual(false);
      expect(customOutputCalled).toEqual(false);

      // outputs are exposed
      const outputDirective = ngMocks.findInstance(OutputDirective);
      expect(isMockOf(outputDirective, OutputDirective)).toEqual(
        true,
      ); // mock
      outputDirective.output.emit();
      expect(customOutputCalled).toEqual(true);
    });
  });
});
