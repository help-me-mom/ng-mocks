import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  Input,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[testDirective]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
})
class TestDirective implements AfterViewInit {
  @Input() color = 'red';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.style.backgroundColor = this.color;
  }
}

@Component({
  selector: 'app-target',
  template: `<a testDirective>name: {{ name }}</a>`,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    TestDirective,
  ],
})
class TargetComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3100
describe('issue-3100', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('should do something', () => {
    MockRender(TargetComponent, {
      name: 'sandbox',
    });

    expect(() => ngMocks.findInstance(TargetComponent)).not.toThrow();
    expect(() => ngMocks.findInstance(TestDirective)).not.toThrow();
  });
});
