import {
  Component,
  Directive,
  HostBinding,
  Input,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive(
  {
    selector: 'host',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class HostDirective {
  @HostBinding('attr.name') @Input() input?: string;

  public hostTestHostDirective() {}
}

@Component(
  {
    selector: 'target',
    hostDirectives: [
      {
        directive: HostDirective,
        inputs: ['input'],
      },
    ],
    template: 'target',
  } as never /* TODO: remove after upgrade to a15 */,
)
class TargetComponent {
  public targetTestHostDirective() {}
}

describe('TestHostDirective', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(HostDirective, TargetComponent));

  it('keeps host directives', () => {
    const fixture = MockRender(TargetComponent, { input: 'test' });

    const directive = ngMocks.findInstance(HostDirective);
    expect(directive.input).toEqual('test');
    expect(ngMocks.formatHtml(fixture)).toContain(' name="test"');
  });
});
