import {
  Component,
  Directive,
  HostBinding,
  inject,
  Injectable,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class FontRegistry {
  public static constructed = 0;

  public constructor() {
    FontRegistry.constructed += 1;
  }

  public getDefaultClasses(): string[] {
    return ['library-icon', '', 'ligature'];
  }
}

@Injectable({ providedIn: 'root' })
class MediaMatcher {
  public static constructed = 0;

  public constructor() {
    MediaMatcher.constructed += 1;
  }

  public matchMedia(): { matches: boolean } {
    return { matches: false };
  }
}

@Injectable({ providedIn: 'root' })
class LabelDependency {
  public static constructed = 0;

  public constructor() {
    LabelDependency.constructed += 1;
  }

  public echo(): string {
    return 'real label';
  }
}

@Injectable({ providedIn: 'root' })
class LabelService {
  public static constructed = 0;

  public constructor(public readonly dependency: LabelDependency) {
    LabelService.constructed += 1;
  }

  public echo(): string {
    return this.dependency.echo();
  }
}

@Injectable({ providedIn: 'root' })
class ApplicationService {
  public static constructed = 0;

  public constructor() {
    ApplicationService.constructed += 1;
  }

  public echo(): string {
    return 'real application';
  }
}

@Component({
  selector: 'icon-15042',
  standalone: true,
  template: '{{ classes }} {{ label.echo() }}',
})
class IconComponent {
  public readonly registry = inject(FontRegistry);

  public constructor(public readonly label: LabelService) {}

  public get classes(): string {
    return this.registry
      .getDefaultClasses()
      .filter(value => value.length > 0)
      .join(' ');
  }
}

@Directive({
  selector: '[button-15042]',
  standalone: true,
})
class ButtonDirective {
  public readonly matcher = inject(MediaMatcher);

  @HostBinding('attr.data-matches')
  public get matches(): boolean {
    return this.matcher.matchMedia().matches;
  }
}

@Component({
  imports: [ButtonDirective, IconComponent],
  selector: 'host-15042',
  standalone: true,
  template: `
    <button button-15042><icon-15042></icon-15042></button>
    {{ application.echo() }}
  `,
})
class HostComponent {
  public readonly application = inject(ApplicationService);
}

@Component({
  imports: [ButtonDirective, IconComponent],
  selector: 'library-15042',
  standalone: true,
  template: '<button button-15042><icon-15042></icon-15042></button>',
})
class LibraryComponent {}

@Component({
  imports: [LibraryComponent],
  selector: 'nested-host-15042',
  standalone: true,
  template: '<library-15042></library-15042>{{ application.echo() }}',
})
class NestedHostComponent {
  public readonly application = inject(ApplicationService);
}

@Component({
  selector: 'shallow-label-15042',
  standalone: true,
  template: '{{ label.echo() }}',
})
class ShallowLabelComponent {
  public readonly label = inject(LabelService);
  public readonly application = inject(ApplicationService);
}

@Component({
  imports: [IconComponent, ShallowLabelComponent],
  standalone: true,
  template:
    '<shallow-label-15042></shallow-label-15042><icon-15042></icon-15042>',
})
class ShallowFirstComponent {}

@Component({
  imports: [IconComponent, ShallowLabelComponent],
  standalone: true,
  template:
    '<icon-15042></icon-15042><shallow-label-15042></shallow-label-15042>',
})
class DeepFirstComponent {}

// Keeping standalone dependencies must retain the root services they need to render.
// Constructor roots are distinct from inject() roots so metadata cannot mask either path.
// @see https://github.com/help-me-mom/ng-mocks/issues/15042
describe('issue-15042', () => {
  beforeEach(() => {
    ngMocks.autoSpy('default');
    FontRegistry.constructed = 0;
    MediaMatcher.constructed = 0;
    LabelDependency.constructed = 0;
    LabelService.constructed = 0;
    ApplicationService.constructed = 0;
  });
  afterEach(() => ngMocks.autoSpy('reset'));

  it('mocks explicitly shallow standalone dependencies without auto-spy', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective, { shallow: true })
      .keep(IconComponent, { shallow: true });

    // Inspect construction before bindings consume the empty mock results.
    const fixture = MockRender(HostComponent, {}, false);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);
    const registry = TestBed.inject(FontRegistry);
    const matcher = TestBed.inject(MediaMatcher);
    const application = TestBed.inject(ApplicationService);

    expect(icon.registry).toBe(registry);
    expect(button.matcher).toBe(matcher);
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(fixture.point.componentInstance.application).toBe(
      application,
    );
    expect(registry.getDefaultClasses()).toBeUndefined();
    expect(matcher.matchMedia()).toBeUndefined();
    expect(icon.label.echo()).toBeUndefined();
    expect(application.echo()).toBeUndefined();
    expect(FontRegistry.constructed).toBe(0);
    expect(MediaMatcher.constructed).toBe(0);
    expect(LabelDependency.constructed).toBe(0);
    expect(LabelService.constructed).toBe(0);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('renders kept standalone dependencies without additional root keeps', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective)
      .keep(IconComponent);

    const fixture = MockRender(HostComponent);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);
    const application = TestBed.inject(ApplicationService);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(icon.label.dependency).toBe(
      TestBed.inject(LabelDependency),
    );
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(fixture.point.componentInstance.application).toBe(
      application,
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'library-icon ligature real label',
    );
    expect(
      ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
        .matches,
    ).toBe('false');
    expect(application.echo()).toBeUndefined();
    expect(FontRegistry.constructed).toBe(1);
    expect(MediaMatcher.constructed).toBe(1);
    expect(LabelDependency.constructed).toBe(1);
    expect(LabelService.constructed).toBe(1);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('preserves constructor and inject roots when shallow testing is explicitly disabled', async () => {
    await MockBuilder(IconComponent).keep(IconComponent, {
      shallow: false,
    });

    const fixture = MockRender(IconComponent);
    const icon = fixture.point.componentInstance;

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(icon.label.dependency).toBe(
      TestBed.inject(LabelDependency),
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'library-icon ligature real label',
    );
    expect(FontRegistry.constructed).toBe(1);
    expect(LabelDependency.constructed).toBe(1);
    expect(LabelService.constructed).toBe(1);
    expect(MediaMatcher.constructed).toBe(0);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('preserves constructor and inject roots of globally kept standalone dependencies', async () => {
    try {
      ngMocks.globalKeep(IconComponent);
      ngMocks.globalKeep(ButtonDirective);
      await MockBuilder(HostComponent);

      const fixture = MockRender(HostComponent);
      const icon = ngMocks.findInstance(fixture, IconComponent);
      const button = ngMocks.findInstance(fixture, ButtonDirective);

      expect(icon.registry).toBe(TestBed.inject(FontRegistry));
      expect(icon.label).toBe(TestBed.inject(LabelService));
      expect(icon.label.dependency).toBe(
        TestBed.inject(LabelDependency),
      );
      expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
      expect(ngMocks.formatText(fixture)).toEqual(
        'library-icon ligature real label',
      );
      expect(
        ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
          .matches,
      ).toBe('false');
      expect(fixture.point.componentInstance.application).toBe(
        TestBed.inject(ApplicationService),
      );
      expect(
        fixture.point.componentInstance.application.echo(),
      ).toBeUndefined();
      expect(FontRegistry.constructed).toBe(1);
      expect(MediaMatcher.constructed).toBe(1);
      expect(LabelDependency.constructed).toBe(1);
      expect(LabelService.constructed).toBe(1);
      expect(ApplicationService.constructed).toBe(0);
    } finally {
      ngMocks.globalWipe(IconComponent);
      ngMocks.globalWipe(ButtonDirective);
    }
  });

  it('preserves roots of transitive standalone imports inside a kept dependency', async () => {
    await MockBuilder(NestedHostComponent).keep(LibraryComponent);

    const fixture = MockRender(NestedHostComponent);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(icon.label.dependency).toBe(
      TestBed.inject(LabelDependency),
    );
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(ngMocks.formatText(fixture)).toEqual(
      'library-icon ligature real label',
    );
    expect(
      ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
        .matches,
    ).toBe('false');
    expect(fixture.point.componentInstance.application).toBe(
      TestBed.inject(ApplicationService),
    );
    expect(
      fixture.point.componentInstance.application.echo(),
    ).toBeUndefined();
    expect(FontRegistry.constructed).toBe(1);
    expect(MediaMatcher.constructed).toBe(1);
    expect(LabelDependency.constructed).toBe(1);
    expect(LabelService.constructed).toBe(1);
    expect(ApplicationService.constructed).toBe(0);
  });

  for (const host of [ShallowFirstComponent, DeepFirstComponent]) {
    it(`preserves a discovered shared root with ${host.name}`, async () => {
      await MockBuilder(host)
        .keep(IconComponent)
        .keep(ShallowLabelComponent, { shallow: true });

      const fixture = MockRender(host);
      const icon = ngMocks.findInstance(fixture, IconComponent);
      const shallow = ngMocks.findInstance(
        fixture,
        ShallowLabelComponent,
      );
      const label = TestBed.inject(LabelService);

      // The kept icon's constructor metadata reveals this root before either
      // declaration is created. Its keep must win over automatic root mocking.
      expect(icon.label).toBe(label);
      expect(shallow.label).toBe(label);
      expect(label.dependency).toBe(TestBed.inject(LabelDependency));
      expect(label.echo()).toBe('real label');
      expect(icon.classes).toBe('library-icon ligature');
      expect(shallow.application).toBe(
        TestBed.inject(ApplicationService),
      );
      expect(shallow.application.echo()).toBeUndefined();
      expect(FontRegistry.constructed).toBe(1);
      expect(LabelDependency.constructed).toBe(1);
      expect(LabelService.constructed).toBe(1);
      expect(ApplicationService.constructed).toBe(0);
    });
  }

  it('mocks kept declarations root dependencies when explicitly requested', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective)
      .keep(IconComponent)
      .mock(NG_MOCKS_ROOT_PROVIDERS);

    const fixture = MockRender(HostComponent, {}, false);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(icon.registry.getDefaultClasses()).toBeUndefined();
    expect(icon.label.echo()).toBeUndefined();
    expect(button.matcher.matchMedia()).toBeUndefined();
    expect(FontRegistry.constructed).toBe(0);
    expect(MediaMatcher.constructed).toBe(0);
    expect(LabelDependency.constructed).toBe(0);
    expect(LabelService.constructed).toBe(0);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('renders kept declarations with individually kept root services', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective)
      .keep(IconComponent)
      .keep(FontRegistry)
      .keep(MediaMatcher)
      .mock(ApplicationService, {
        echo: () => 'mock application',
      });

    const fixture = MockRender(HostComponent);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);
    const application = TestBed.inject(ApplicationService);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(fixture.point.componentInstance.application).toBe(
      application,
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'library-icon ligature real label mock application',
    );
    expect(
      ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
        .matches,
    ).toBe('false');
    expect(application.echo()).toBe('mock application');
    expect(FontRegistry.constructed).toBe(1);
    expect(MediaMatcher.constructed).toBe(1);
    expect(LabelDependency.constructed).toBe(1);
    expect(LabelService.constructed).toBe(1);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('keeps library root providers while respecting an explicit application mock', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective)
      .keep(IconComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(ApplicationService, {
        echo: () => 'mock application',
      });

    const fixture = MockRender(HostComponent);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);
    const application = TestBed.inject(ApplicationService);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(fixture.point.componentInstance.application).toBe(
      application,
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'library-icon ligature real label mock application',
    );
    expect(
      ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
        .matches,
    ).toBe('false');
    expect(application.echo()).toBe('mock application');
    expect(FontRegistry.constructed).toBe(1);
    expect(MediaMatcher.constructed).toBe(1);
    expect(LabelDependency.constructed).toBe(1);
    expect(LabelService.constructed).toBe(1);
    expect(ApplicationService.constructed).toBe(0);
  });

  it('renders with customized root mocks without constructing real services', async () => {
    await MockBuilder(HostComponent)
      .keep(ButtonDirective)
      .keep(IconComponent)
      .mock(FontRegistry, {
        getDefaultClasses: () => ['custom-icon', ''],
      })
      .mock(MediaMatcher, {
        matchMedia: () => ({ matches: true }),
      })
      .mock(LabelService, {
        echo: () => 'custom label',
      })
      .mock(ApplicationService, {
        echo: () => 'mock application',
      });

    const fixture = MockRender(HostComponent);
    const icon = ngMocks.findInstance(fixture, IconComponent);
    const button = ngMocks.findInstance(fixture, ButtonDirective);

    expect(icon.registry).toBe(TestBed.inject(FontRegistry));
    expect(icon.label).toBe(TestBed.inject(LabelService));
    expect(button.matcher).toBe(TestBed.inject(MediaMatcher));
    expect(fixture.point.componentInstance.application).toBe(
      TestBed.inject(ApplicationService),
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'custom-icon custom label mock application',
    );
    expect(
      ngMocks.find(fixture, ButtonDirective).nativeElement.dataset
        .matches,
    ).toBe('true');
    expect(FontRegistry.constructed).toBe(0);
    expect(MediaMatcher.constructed).toBe(0);
    expect(LabelDependency.constructed).toBe(0);
    expect(LabelService.constructed).toBe(0);
    expect(ApplicationService.constructed).toBe(0);
  });
});
