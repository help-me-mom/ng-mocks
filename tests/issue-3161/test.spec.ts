import {
  Component,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'translate',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class TranslatePipe implements PipeTransform {
  transform(value: string) {
    return `${this.constructor.name}:real:${value}`;
  }
}

@NgModule({
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
})
class TranslateModule {}

@Pipe({
  name: 'translate',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class MockTranslatePipe implements PipeTransform {
  transform(value: string) {
    return `${this.constructor.name}:mock:${value}`;
  }
}

@NgModule({
  declarations: [MockTranslatePipe],
  exports: [MockTranslatePipe],
})
class MockTranslateModule {}

ngMocks.globalReplace(TranslateModule, MockTranslateModule);

@Component({
  selector: 'standalone',
  template: `{{ name | translate }}`,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    TranslateModule,
  ],
})
class StandaloneComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3161
describe('issue-3161', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // TODO pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(StandaloneComponent));

  it('uses replaced pipe', () => {
    const fixture = MockRender(StandaloneComponent, {
      name: 'sandbox',
    });

    expect(ngMocks.formatText(fixture)).toEqual(
      `${MockTranslatePipe.name}:mock:sandbox`,
    );
  });
});
