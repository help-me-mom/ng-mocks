import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockPipe,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class StandaloneService {}

@NgModule({
  providers: [StandaloneService],
})
class StandaloneModule {}

@Pipe({
  name: 'standalone',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
})
class StandalonePipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }
}

@Component({
  selector: 'standalone',
  template: 'service:{{ service.constructor.name }}',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    StandaloneModule,
    StandalonePipe,
  ],
})
class StandaloneComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component({
  selector: 'empty',
  template: 'empty',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [], // this is the thing we assert: an empty imports array
})
class EmptyComponent {}

@Component({
  selector: 'target-2687',
  template: '<standalone></standalone> pipe:{{ null | standalone }}',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    StandaloneComponent,
    StandalonePipe,
    EmptyComponent,
  ],
})
class TargetComponent {}

describe('issue-2687', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent, StandaloneComponent],
      }).compileComponents(),
    );

    it('renders StandaloneComponent', () => {
      const fixture = TestBed.createComponent(StandaloneComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        'service:StandaloneService',
      );
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<standalone>service:StandaloneService</standalone> pipe:StandalonePipe',
      );
    });
  });

  describe('override', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent, StandaloneComponent],
      }).compileComponents(),
    );

    beforeEach(() => {
      TestBed.overrideComponent(TargetComponent, {
        set: {
          ['imports' as never /* TODO: remove after upgrade to a14 */]:
            [
              MockComponent(StandaloneComponent),
              MockPipe(StandalonePipe),
            ],
        },
      });
    });

    afterAll(() => {
      TestBed.overrideComponent(TargetComponent, {
        set: {
          ['imports' as never /* TODO: remove after upgrade to a14 */]:
            [StandaloneComponent, StandalonePipe],
        },
      });
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<standalone></standalone> pipe:',
      );

      const standaloneComponent = ngMocks.findInstance(
        fixture,
        StandaloneComponent,
      );
      expect(
        isMockOf(standaloneComponent, StandaloneComponent),
      ).toEqual(true);

      const standalonePipe = ngMocks.findInstance(
        fixture,
        StandalonePipe,
      );
      expect(isMockOf(standalonePipe, StandalonePipe)).toEqual(true);
    });
  });

  describe('.mock', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('renders TargetComponent', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target-2687><standalone></standalone> pipe:</target-2687>',
      );
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandalonePipe),
      ).not.toThrow();
    });
  });

  describe('.keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).keep(StandalonePipe),
    );

    it('renders TargetComponent', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target-2687><standalone></standalone> pipe:StandalonePipe</target-2687>',
      );
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandalonePipe),
      ).not.toThrow();
    });
  });

  describe('StandaloneComponent:exclude', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).exclude(StandalonePipe),
    );

    it('renders TargetComponent', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /The pipe 'standalone' could not be found/,
      );
    });
  });
});
