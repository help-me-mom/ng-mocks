import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockDirectives, ngMocks } from 'ng-mocks';

@Directive(
  {
    selector: 'base',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class BaseDirective {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public base5117coverage() {}
}

@Directive(
  {
    selector: 'input',
    standalone: true,
    hostDirectives: [BaseDirective],
  } as never /* TODO: remove after upgrade to a15 */,
)
class InputDirective {
  @Input() public readonly input: string | undefined = undefined;

  public input5117coverage() {}
}

@Directive(
  {
    selector: 'output',
    standalone: true,
    hostDirectives: [
      {
        directive: InputDirective,
        inputs: ['input: customInput'],
      },
    ],
  } as never /* TODO: remove after upgrade to a15 */,
)
class OutputDirective {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public output25117coverage() {}
}

@Component(
  {
    selector: 'target',
    template: '',
    hostDirectives: [
      {
        directive: OutputDirective,
        inputs: ['input: customInput'],
        outputs: ['output: customOutput'],
      },
    ],
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public target5117coverage() {}
}

@Component({
  selector: 'render',
  template:
    '<target [input]="input" (output)="output()" [customInput]="customInput" (customOutput)="customOutput()"></target>',
})
class RenderComponent {
  public readonly input = 'input';
  public outputCalled = false;
  public readonly output = () => (this.outputCalled = true);
  public readonly customInput = 'customInput';
  public customOutputCalled = false;
  public readonly customOutput = () =>
    (this.customOutputCalled = true);

  public render5117coverage() {}
}

describe('issue-5117:coverage', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent, RenderComponent],
      }).compileComponents(),
    );

    it('binds host directives correctly', () => {
      const fixture = TestBed.createComponent(RenderComponent);
      fixture.detectChanges();

      // default state
      const component = ngMocks.findInstance(RenderComponent);
      expect(component.outputCalled).toEqual(false);
      expect(component.customOutputCalled).toEqual(false);

      // inputs and outputs aren't exposed
      const base = ngMocks.findInstance(BaseDirective);
      expect(isMockOf(base, BaseDirective)).toEqual(false); // real
      expect(base.input).toEqual(undefined);
      base.output.emit();
      expect(component.outputCalled).toEqual(false);

      // inputs are exposed
      const input = ngMocks.findInstance(InputDirective);
      expect(isMockOf(input, InputDirective)).toEqual(false); // real
      expect(input.input).toEqual(component.customInput); // a bug in angular? nested input

      // outputs are exposed
      const output = ngMocks.findInstance(OutputDirective);
      expect(isMockOf(output, OutputDirective)).toEqual(false); // real
      expect(output.input).toEqual(component.customInput);
      output.output.emit();
      expect(component.customOutputCalled).toEqual(true);
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: MockDirectives(
          OutputDirective,
          InputDirective,
          BaseDirective,
        ),
        declarations: [TargetComponent, RenderComponent],
      }).compileComponents(),
    );

    it('binds host directives correctly', () => {
      const fixture = TestBed.createComponent(RenderComponent);
      fixture.detectChanges();

      // default state
      const component = ngMocks.findInstance(RenderComponent);
      expect(component.outputCalled).toEqual(false);
      expect(component.customOutputCalled).toEqual(false);

      // inputs and outputs aren't exposed
      const base = ngMocks.findInstance(BaseDirective);
      expect(isMockOf(base, BaseDirective)).toEqual(true); // mock
      expect(base.input).toEqual(undefined);
      base.output.emit();
      expect(component.outputCalled).toEqual(false);

      // inputs are exposed
      const input = ngMocks.findInstance(InputDirective);
      expect(isMockOf(input, InputDirective)).toEqual(true); // mock
      expect(input.input).toEqual(component.customInput); // a bug in angular? nested input

      // outputs are exposed
      const output = ngMocks.findInstance(OutputDirective);
      expect(isMockOf(output, OutputDirective)).toEqual(true); // mock
      expect(output.input).toEqual(component.customInput);
      output.output.emit();
      expect(component.customOutputCalled).toEqual(true);
    });
  });
});
