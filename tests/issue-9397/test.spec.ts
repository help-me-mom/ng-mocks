import { DOCUMENT } from '@angular/common';
import {
  Component,
  Directive,
  Inject,
  inject,
  Injectable,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetService {
  public static constructed = 0;

  public constructor(@Inject(DOCUMENT) document: Document) {
    void document;
    TargetService.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Component({
  selector: 'target-9397',
  standalone: true,
  template: '',
})
class TargetComponent implements OnInit {
  public readonly service = inject(TargetService);

  public ngOnInit(): void {
    this.service.echo();
  }
}

@Directive({
  selector: '[target-9397]',
  standalone: true,
})
class TargetDirective implements OnInit {
  public readonly service = inject(TargetService);

  public ngOnInit(): void {
    this.service.echo();
  }
}

@Pipe({
  name: 'target9397',
  standalone: true,
})
class TargetPipe implements PipeTransform {
  public readonly service = inject(TargetService);

  public transform(value: string): string {
    this.service.echo();

    return value;
  }
}

@Component({
  imports: [TargetDirective, TargetPipe],
  selector: 'host-9397',
  standalone: true,
  template: '<div target-9397>{{ "value" | target9397 }}</div>',
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/9397
describe('issue-9397', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : 'requireActual' in jest
          ? 'jest'
          : 'vitest',
    ),
  );
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TargetService.constructed = 0;
  });

  describe('standalone component', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('mocks inject() dependencies before the initial lifecycle', () => {
      const fixture = MockRender(TargetComponent);
      const service = TestBed.inject(TargetService);

      expect(service.echo).toHaveBeenCalledTimes(1);
      expect(fixture.point.componentInstance.service).toBe(service);
      expect(TargetService.constructed).toBe(0);
    });
  });

  describe('customization', () => {
    MockInstance.scope();

    beforeEach(() => MockBuilder(TargetComponent));

    it('applies MockInstance customizations to the runtime mock', () => {
      MockInstance(TargetService, 'echo', () => 'custom');

      const fixture = MockRender(TargetComponent);
      const service = TestBed.inject(TargetService);

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo()).toBe('custom');
      expect(TargetService.constructed).toBe(0);
    });
  });

  describe('explicit keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).keep(TargetService),
    );

    it('preserves explicitly kept runtime dependencies', () => {
      const fixture = MockRender(TargetComponent);
      const service = TestBed.inject(TargetService);

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo()).toBe('real');
      expect(TargetService.constructed).toBe(1);
    });
  });

  describe('global keep', () => {
    beforeEach(() => {
      ngMocks.globalKeep(TargetService);

      return MockBuilder(TargetComponent);
    });
    afterEach(() => ngMocks.globalWipe(TargetService));

    it('preserves globally kept runtime dependencies', () => {
      const fixture = MockRender(TargetComponent);
      const service = TestBed.inject(TargetService);

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo()).toBe('real');
      expect(TargetService.constructed).toBe(1);
    });
  });

  describe('global exclude', () => {
    beforeEach(() => {
      ngMocks.globalExclude(TargetService);

      return MockBuilder(TargetComponent);
    });
    afterEach(() => ngMocks.globalWipe(TargetService));

    it('preserves globally excluded runtime dependencies', () => {
      const fixture = MockRender(TargetComponent);
      const service = TestBed.inject(TargetService);

      expect(fixture.point.componentInstance.service).toBe(service);
      expect(service.echo()).toBe('real');
      expect(TargetService.constructed).toBe(1);
    });
  });

  describe('kept standalone declarations', () => {
    beforeEach(() =>
      MockBuilder(HostComponent)
        .keep(TargetDirective)
        .keep(TargetPipe),
    );

    it('mocks inject() dependencies for directives and pipes before use', () => {
      const fixture = MockRender(HostComponent);
      const service = TestBed.inject(TargetService);

      expect(service.echo).toHaveBeenCalledTimes(2);
      expect(
        ngMocks.findInstance(fixture, TargetDirective).service,
      ).toBe(service);
      expect(ngMocks.findInstance(fixture, TargetPipe).service).toBe(
        service,
      );
      expect(TargetService.constructed).toBe(0);
    });
  });
});
