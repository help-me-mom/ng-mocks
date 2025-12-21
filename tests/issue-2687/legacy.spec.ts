import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Injectable()
class StandaloneService {}

@NgModule({
  providers: [StandaloneService],
})
class StandaloneModule {}

@Pipe({
  name: 'standalone',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
})
class StandalonePipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }
}

@Component({
  selector: 'standalone',
  template: 'service:{{ service.constructor.name }}',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    StandaloneModule,
    StandalonePipe,
  ],
})
class StandaloneComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component({
  selector: 'target-2687-legacy',
  template: '<standalone></standalone> pipe:{{ null | standalone }}',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    StandaloneComponent,
    StandalonePipe,
  ],
})
class TargetComponent {}

@Component({
  selector: 'render-standalone-component',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<standalone></standalone>',
})
class RenderStandaloneComponentComponent {}

@Component({
  selector: 'render-standalone-pipe',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ null | standalone }}',
})
class RenderStandalonePipeComponent {}

@Component({
  selector: 'render-standalone-service',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class RenderStandaloneServiceComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component({
  selector: 'render-target-component',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<target-2687-legacy></target-2687-legacy>',
})
class RenderTargetComponentComponent {}

describe('issue-2687', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // TODO pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('legacy:real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent, StandaloneComponent],
        declarations: [
          RenderStandaloneComponentComponent,
          RenderStandalonePipeComponent,
          RenderStandaloneServiceComponent,
          RenderTargetComponentComponent,
        ],
      }).compileComponents(),
    );

    it('renders StandaloneComponent', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneComponentComponent,
      );
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        `<standalone>service:${StandaloneService.name}</standalone>`,
      );

      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });

    it('renders StandalonePipe', () => {
      try {
        TestBed.createComponent(RenderStandalonePipeComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `The pipe 'standalone' could not be found`,
        );
      }
    });

    it('renders StandaloneService', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneServiceComponent,
      );
      fixture.detectChanges();
      expect(
        fixture.componentInstance.service.constructor.name,
      ).toEqual(StandaloneService.name);
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(
        RenderTargetComponentComponent,
      );
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        `<target-2687-legacy><standalone>service:${StandaloneService.name}</standalone> pipe:${StandalonePipe.name}</target-2687-legacy>`,
      );

      expect(() =>
        ngMocks.findInstance(TargetComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandalonePipe),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });
  });

  describe('legacy:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [
          MockComponent(TargetComponent),
          MockComponent(StandaloneComponent),
        ],
        declarations: [
          RenderStandaloneComponentComponent,
          RenderStandalonePipeComponent,
          RenderStandaloneServiceComponent,
          RenderTargetComponentComponent,
        ],
      }).compileComponents(),
    );

    it('renders StandaloneComponent', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneComponentComponent,
      );
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<standalone></standalone>',
      );

      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });

    it('renders StandalonePipe', () => {
      try {
        TestBed.createComponent(RenderStandalonePipeComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `The pipe 'standalone' could not be found`,
        );
      }
    });

    it('renders StandaloneService', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneServiceComponent,
      );
      fixture.detectChanges();
      expect(
        fixture.componentInstance.service.constructor.name,
      ).toEqual(StandaloneService.name);
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(
        RenderTargetComponentComponent,
      );
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target-2687-legacy></target-2687-legacy>',
      );

      expect(() =>
        ngMocks.findInstance(TargetComponent),
      ).not.toThrow();
      try {
        ngMocks.findInstance(StandaloneComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `Cannot find an instance via ngMocks.findInstance(${StandaloneComponent.name})`,
        );
      }
      try {
        ngMocks.findInstance(StandalonePipe);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `Cannot find an instance via ngMocks.findInstance(${StandalonePipe.name})`,
        );
      }
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });
  });
});
