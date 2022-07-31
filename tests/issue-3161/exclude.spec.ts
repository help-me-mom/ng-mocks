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

ngMocks.globalExclude(TranslateModule);

@Component(
  {
    selector: 'standalone',
    standalone: true,
    template: `{{ name | translate }}`,
    imports: [TranslateModule],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3161
describe('issue-3161:exclude', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(StandaloneComponent));

  it('fails because of excluded module', () => {
    expect(() =>
      MockRender(StandaloneComponent, {
        name: 'sandbox',
      }),
    ).toThrowError(/The pipe 'translate' could not be found/);
  });
});
