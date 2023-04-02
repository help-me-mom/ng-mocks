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
    selector: 'target1',
    standalone: true,
    hostDirectives: [],
  } as never /* TODO: remove after upgrade to a15 */,
)
class Target1Directive {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public target15117() {}
}

@Directive(
  {
    selector: 'target2',
    standalone: true,
    hostDirectives: [Target1Directive],
  } as never /* TODO: remove after upgrade to a15 */,
)
class Target2Directive {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public target25117() {}
}

@Component(
  {
    selector: 'target',
    template: '',
    hostDirectives: [
      {
        directive: Target2Directive,
        inputs: ['input: customInput'],
        outputs: ['output: customOutput'],
      },
    ],
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  @Input() public readonly input: string | undefined = undefined;
  @Output() public readonly output = new EventEmitter<void>();

  public target5117() {}
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

  public render5117() {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/5117
// @see https://angular.io/guide/directive-composition-api
describe('issue-5117', () => {
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
      const dir1 = ngMocks.findInstance(Target1Directive);
      expect(isMockOf(dir1, Target1Directive)).toEqual(false); // real
      expect(dir1.input).toEqual(undefined);
      dir1.output.emit();
      expect(component.outputCalled).toEqual(false);

      // inputs and outputs are exposed
      const dir2 = ngMocks.findInstance(Target2Directive);
      expect(isMockOf(dir2, Target2Directive)).toEqual(false); // real
      expect(dir2.input).toEqual(component.customInput);
      dir2.output.emit();
      expect(component.customOutputCalled).toEqual(true);
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, [
        Target1Directive,
        Target2Directive,
      ]),
    );

    it('binds host directives correctly', () => {
      const input = 'input';
      let outputCalled = false;
      const output = () => (outputCalled = true);
      const customInput = 'customInput';
      let customOutputCalled = false;
      const customOutput = () => (customOutputCalled = true);

      MockRender(TargetComponent, {
        input,
        output,
        customInput,
        customOutput,
      });

      // default state
      expect(outputCalled).toEqual(false);
      expect(customOutputCalled).toEqual(false);

      // inputs and outputs aren't exposed
      const dir1 = ngMocks.findInstance(Target1Directive);
      expect(isMockOf(dir1, Target1Directive)).toEqual(true); // mock
      expect(dir1.input).toEqual(undefined);
      dir1.output.emit();
      expect(outputCalled).toEqual(false);

      // inputs and outputs are exposed
      const dir2 = ngMocks.findInstance(Target2Directive);
      expect(isMockOf(dir2, Target2Directive)).toEqual(true); // mock
      expect(dir2.input).toEqual(customInput);
      dir2.output.emit();
      expect(customOutputCalled).toEqual(true);
    });
  });
});
