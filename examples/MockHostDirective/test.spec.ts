import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive(
  {
    selector: 'host',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class HostDirective {
  @Input() input?: string;
  @Output() output = new EventEmitter<void>();

  public hostMockHostDirective() {}
}

@Component(
  {
    selector: 'target',
    hostDirectives: [
      {
        directive: HostDirective,
        inputs: ['input'],
        outputs: ['output'],
      },
    ],
    template: 'target',
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  public targetMockHostDirective() {}
}

describe('MockHostDirective', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockDirective(HostDirective)],
        declarations: [TargetComponent],
      }).compileComponents(),
    );

    it('mocks host directives', () => {
      const fixture = TestBed.createComponent(TargetComponent);

      const directive = ngMocks.findInstance(fixture, HostDirective);
      expect(directive).toBeDefined();
    });
  });

  describe('MockBuilder', () => {
    beforeEach(() => MockBuilder(TargetComponent, HostDirective));

    it('mocks host directives', () => {
      MockRender(TargetComponent, { input: 'test' });

      const directive = ngMocks.findInstance(HostDirective);
      expect(directive.input).toEqual('test');
    });
  });

  describe('MockBuilder:shallow', () => {
    beforeEach(() =>
      MockBuilder().mock(TargetComponent, { shallow: true }),
    );

    it('mocks host directives', () => {
      MockRender(TargetComponent, { input: 'test' });

      const directive = ngMocks.findInstance(HostDirective);
      expect(directive.input).toEqual('test');
    });
  });
});
