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

@Pipe(
  {
    name: 'standalone',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandalonePipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }
}

@Component(
  {
    selector: 'standalone',
    template: 'service:{{ service.constructor.name }}',
    standalone: true,
    imports: [StandaloneModule, StandalonePipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component(
  {
    selector: 'target-2687-legacy',
    template:
      '<standalone></standalone> pipe:{{ null | standalone }}',
    standalone: true,
    imports: [StandaloneComponent, StandalonePipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class TargetComponent {}

@Component({
  selector: 'render-standalone-component',
  template: '<standalone></standalone>',
})
class RenderStandaloneComponentComponent {}

@Component({
  selector: 'render-standalone-pipe',
  template: '{{ null | standalone }}',
})
class RenderStandalonePipeComponent {}

@Component({
  selector: 'render-standalone-service',
  template: '',
})
class RenderStandaloneServiceComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component({
  selector: 'render-target-component',
  template: '<target-2687-legacy></target-2687-legacy>',
})
class RenderTargetComponentComponent {}

describe('issue-2687', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
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
        '<standalone>service:StandaloneService</standalone>',
      );

      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });

    it('renders StandalonePipe', () => {
      expect(() =>
        TestBed.createComponent(RenderStandalonePipeComponent),
      ).toThrowError(/The pipe 'standalone' could not be found/);
    });

    it('renders StandaloneService', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneServiceComponent,
      );
      fixture.detectChanges();
      expect(
        fixture.componentInstance.service.constructor.name,
      ).toEqual('StandaloneService');
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(
        RenderTargetComponentComponent,
      );
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target-2687-legacy><standalone>service:StandaloneService</standalone> pipe:StandalonePipe</target-2687-legacy>',
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
      expect(() =>
        TestBed.createComponent(RenderStandalonePipeComponent),
      ).toThrowError(/The pipe 'standalone' could not be found/);
    });

    it('renders StandaloneService', () => {
      const fixture = TestBed.createComponent(
        RenderStandaloneServiceComponent,
      );
      fixture.detectChanges();
      expect(
        fixture.componentInstance.service.constructor.name,
      ).toEqual('StandaloneService');
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
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).toThrowError(
        'Cannot find an instance via ngMocks.findInstance(StandaloneComponent)',
      );
      expect(() => ngMocks.findInstance(StandalonePipe)).toThrowError(
        'Cannot find an instance via ngMocks.findInstance(StandalonePipe)',
      );
      expect(() =>
        ngMocks.findInstance(StandaloneService),
      ).not.toThrow();
    });
  });
});
