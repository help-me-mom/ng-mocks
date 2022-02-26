import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  LOCALE_ID,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'ROOT_TOKEN',
  providedIn: 'root',
});

@((Injectable as any)({
  providedIn: 'root',
}))
class Service {
  public readonly value: string = 'ROOT_SERVICE';
}

@Component({
  selector: 'target',
  template: ':{{ service.value }}:{{ token }}:{{localeId}}:',
})
class TargetComponent {
  public constructor(
    public service: Service,
    @Inject(TOKEN) public token: string,
    @Inject(LOCALE_ID) public localeId: string,
  ) {}
}

// tokens provided on the root level, shouldn't be mocked unless it's explicitly specified.
// @see https://github.com/ike18t/ng-mocks/issues/1932
describe('providedIn:root', () => {
  if (parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('native', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      }),
    );

    it('finds token the root token', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target>:ROOT_SERVICE:ROOT_TOKEN:en-US:</target>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('mocks all root provides apart from ApplicationModule:LOCALE_ID', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target>:::en-US:</target>',
      );
    });
  });

  describe('MockBuilder:keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .keep(Service)
        .keep(TOKEN)
        .keep(LOCALE_ID),
    );

    it('keeps all original values', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target>:ROOT_SERVICE:ROOT_TOKEN:en-US:</target>',
      );
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(Service, { value: 'MOCK_SERVICE' })
        .mock(TOKEN, 'MOCK_TOKEN')
        .mock(LOCALE_ID, 'MOCK_LOCALE_ID'),
    );

    it('mocks all values', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target>:MOCK_SERVICE:MOCK_TOKEN:MOCK_LOCALE_ID:</target>',
      );
    });
  });
});
