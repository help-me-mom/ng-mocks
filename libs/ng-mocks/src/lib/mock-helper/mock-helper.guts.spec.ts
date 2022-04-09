/* eslint-disable max-lines */

import { CommonModule } from '@angular/common';
import {
  Component,
  Directive,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  OnDestroy,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { isMockedNgDefOf } from '../common/func.is-mocked-ng-def-of';
import { isNgDef } from '../common/func.is-ng-def';

import { ngMocks } from './mock-helper';

const TARGET1 = new InjectionToken('TARGET1');
const TARGET2 = new InjectionToken('TARGET2');

@Injectable()
class Target1Service {
  public callback: () => void = () => undefined;

  public touch(): void {
    this.callback();
  }
}

@Pipe({
  name: 'target1',
})
class Target1Pipe implements PipeTransform {
  protected readonly name = 'pipe1';
  public transform(value: string): string {
    return `${this.name}:${value}`;
  }
}

@Component({
  selector: 'target2',
  template: '<ng-content></ng-content>',
})
class Target2Component {}

@Component({
  selector: 'target1',
  template: `<div (target1)="update.emit()">
    {{ greeting | target1 }} {{ target }}
  </div>`,
})
class Target1Component {
  @Input() public readonly greeting: string | null = null;
  @Output()
  public readonly update: EventEmitter<void> = new EventEmitter();

  public constructor(
    @Inject(TARGET1) public readonly target: string,
  ) {}
}

@Directive({
  selector: '[target1]',
})
class Target1Directive implements OnDestroy {
  @Output()
  public readonly target1: EventEmitter<void> = new EventEmitter();

  public constructor(public readonly service: Target1Service) {
    this.service.callback = () => this.target1.emit();
  }

  public ngOnDestroy(): void {
    this.service.callback = () => undefined;
  }
}

@NgModule({
  declarations: [Target2Component],
  exports: [Target2Component],
  providers: [
    {
      provide: TARGET1,
      useValue: 'target1',
    },
  ],
})
class Target2Module {}

@NgModule({
  declarations: [Target1Pipe, Target1Component, Target1Directive],
  imports: [CommonModule, Target2Module],
  providers: [
    Target1Service,
    {
      provide: TARGET1,
      useValue: 'target1',
    },
  ],
})
class Target1Module {}

@NgModule({
  declarations: [Target1Pipe, Target1Component, Target1Directive],
  imports: [CommonModule, Target2Module],
  providers: [
    Target1Service,
    {
      provide: TARGET1,
      useValue: 'target1',
    },
  ],
})
class Target1CopyModule {}

@NgModule({
  exports: [Target2Module],
  imports: [CommonModule, Target2Module],
})
class Target3Module {}

describe('mock-helper.guts', () => {
  it('mocks guts, but keeps the declaration', () => {
    const ngModule = ngMocks.guts(Target1Component, Target1Module);
    expect(ngModule).toBeDefined();
    expect(ngModule.declarations?.length).toEqual(3);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'p')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.declarations[0], Target1Pipe, 'p'),
      ).toBeTruthy();
      expect(isNgDef(ngModule.declarations[1], 'c')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[1],
          Target1Component,
          'c',
        ),
      ).toBeFalsy();
      expect(isNgDef(ngModule.declarations[2], 'd')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[2],
          Target1Directive,
          'd',
        ),
      ).toBeTruthy();
    }
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(isNgDef(ngModule.imports[0], 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.imports[0], CommonModule, 'm'),
      ).toBeFalsy();
      expect(isNgDef(ngModule.imports[1], 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.imports[1], Target2Module, 'm'),
      ).toBeTruthy();
    }
    expect(ngModule.providers?.length).toEqual(2);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        deps: [Injector],
        provide: Target1Service,
        useFactory: jasmine.anything(),
      });
      expect(ngModule.providers[1]).toEqual({
        deps: [Injector],
        provide: TARGET1,
        useFactory: jasmine.anything(),
      });
      expect(ngModule.providers[1].useFactory(null)).toEqual('');
    }
  });

  it('keeps module', () => {
    const ngModule = ngMocks.guts(Target1Module);
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(isNgDef(ngModule.imports[0], 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.imports[0], Target1Module, 'm'),
      ).toBeFalsy();
    }
  });

  it('keeps module with providers', () => {
    const ngModule = ngMocks.guts(Target1Module, {
      ngModule: Target1Module,
      providers: [],
    });
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(isNgDef(ngModule.imports[0].ngModule, 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.imports[0].ngModule,
          Target1Module,
          'm',
        ),
      ).toBeFalsy();
    }
  });

  it('keeps component', () => {
    const ngModule = ngMocks.guts(Target1Component);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'c')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Component,
          'c',
        ),
      ).toBeFalsy();
    }
  });

  it('keeps directive', () => {
    const ngModule = ngMocks.guts(Target1Directive);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'd')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Directive,
          'd',
        ),
      ).toBeFalsy();
    }
  });

  it('keeps pipe', () => {
    const ngModule = ngMocks.guts(Target1Pipe);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'p')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.declarations[0], Target1Pipe, 'p'),
      ).toBeFalsy();
    }
  });

  it('keeps service', () => {
    const ngModule = ngMocks.guts(Target1Service);
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual(Target1Service);
    }
  });

  it('keeps customized service', () => {
    const ngModule = ngMocks.guts(Target1Service, {
      provide: Target1Service,
      useValue: 123,
    });
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        provide: Target1Service,
        useValue: 123,
      });
    }
  });

  it('keeps tokens', () => {
    const ngModule = ngMocks.guts(TARGET1, {
      provide: TARGET1,
      useValue: 123,
    });
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        provide: TARGET1,
        useValue: 123,
      });
    }
  });

  it('skips kept tokens', () => {
    const ngModule = ngMocks.guts(TARGET1);
    expect(ngModule.providers?.length).toEqual(0);
  });

  it('mocks module', () => {
    const ngModule = ngMocks.guts(TARGET2, Target1Module);
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(CommonModule);
      expect(
        isMockedNgDefOf(ngModule.imports[1], Target2Module, 'm'),
      ).toBeTruthy();
    }
  });

  it('mocks module with providers', () => {
    const ngModule = ngMocks.guts(TARGET2, {
      ngModule: Target1Module,
      providers: [],
    });
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(isNgDef(ngModule.imports[0].ngModule, 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.imports[0].ngModule,
          Target1Module,
          'm',
        ),
      ).toBeTruthy();
    }
  });

  it('mocks component', () => {
    const ngModule = ngMocks.guts(TARGET2, Target1Component);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'c')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Component,
          'c',
        ),
      ).toBeTruthy();
    }
  });

  it('mocks directive', () => {
    const ngModule = ngMocks.guts(TARGET2, Target1Directive);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'd')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Directive,
          'd',
        ),
      ).toBeTruthy();
    }
  });

  it('mocks pipe', () => {
    const ngModule = ngMocks.guts(TARGET2, Target1Pipe);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(isNgDef(ngModule.declarations[0], 'p')).toBeTruthy();
      expect(
        isMockedNgDefOf(ngModule.declarations[0], Target1Pipe, 'p'),
      ).toBeTruthy();
    }
  });

  it('mocks service', () => {
    const ngModule = ngMocks.guts(TARGET2, Target1Service);
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        deps: [Injector],
        provide: Target1Service,
        useFactory: jasmine.anything(),
      });
    }
  });

  it('mocks tokens', () => {
    const ngModule = ngMocks.guts(TARGET2, {
      provide: TARGET1,
      useValue: 123,
    });
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        deps: [Injector],
        provide: TARGET1,
        useFactory: jasmine.anything(),
      });
      expect(ngModule.providers[0].useFactory(null)).toEqual(0);
    }
  });

  it('skips existing module with providers', () => {
    const ngModule = ngMocks.guts(TARGET2, [
      {
        ngModule: Target1Module,
        providers: [],
      },
      {
        ngModule: Target1Module,
        providers: [],
      },
    ]);
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(isNgDef(ngModule.imports[0].ngModule, 'm')).toBeTruthy();
      expect(
        isMockedNgDefOf(
          ngModule.imports[0].ngModule,
          Target1Module,
          'm',
        ),
      ).toBeTruthy();
    }
  });

  it('skips existing kept module', () => {
    const ngModule = ngMocks.guts(Target1Module, Target1Module);
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(Target1Module);
    }
  });

  it('skips an existing mock module', () => {
    const ngModule = ngMocks.guts(null, [
      Target1Module,
      Target1CopyModule,
    ]);
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(CommonModule);
      expect(ngModule.imports[1]).toBe(
        getMockedNgDefOf(Target2Module),
      );
    }
  });

  it('skips 2nd kept module', () => {
    const ngModule = ngMocks.guts(Target2Module, [
      Target1Module,
      Target1CopyModule,
    ]);
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(CommonModule);
      expect(ngModule.imports[1]).toBe(Target2Module);
    }
  });

  it('skips the 2nd mock module', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Module,
      Target1CopyModule,
    ]);
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(CommonModule);
      expect(
        isMockedNgDefOf(ngModule.imports[1], Target2Module, 'm'),
      ).toBeTruthy();
    }
  });

  it('skips the 2nd nested mock module', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Module,
      Target3Module,
    ]);
    expect(ngModule.imports?.length).toEqual(2);
    if (ngModule.imports) {
      expect(ngModule.imports[0]).toBe(CommonModule);
      expect(
        isMockedNgDefOf(ngModule.imports[1], Target2Module, 'm'),
      ).toBeTruthy();
    }
  });

  it('skips 2nd kept module with providers', () => {
    const ngModule = ngMocks.guts(Target1Module, [
      {
        ngModule: Target1Module,
        providers: [],
      },
      {
        ngModule: Target1Module,
        providers: [],
      },
    ]);
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(ngModule.imports[0].ngModule).toBe(Target1Module);
    }
  });

  it('skips the 2nd mock module with providers', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      {
        ngModule: Target1Module,
        providers: [],
      },
      {
        ngModule: Target1Module,
        providers: [],
      },
    ]);
    expect(ngModule.imports?.length).toEqual(1);
    if (ngModule.imports) {
      expect(
        isMockedNgDefOf(
          ngModule.imports[0].ngModule,
          Target1Module,
          'm',
        ),
      ).toBeTruthy();
    }
  });

  it('skips 2nd kept component', () => {
    const ngModule = ngMocks.guts(Target1Component, [
      Target1Component,
      Target1Component,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(ngModule.declarations[0]).toBe(Target1Component);
    }
  });

  it('skips the 2nd mock component', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Component,
      Target1Component,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Component,
          'c',
        ),
      ).toBeTruthy();
    }
  });

  it('skips 2nd kept directive', () => {
    const ngModule = ngMocks.guts(Target1Directive, [
      Target1Directive,
      Target1Directive,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(ngModule.declarations[0]).toBe(Target1Directive);
    }
  });

  it('skips the 2nd mock directive', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Directive,
      Target1Directive,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(
        isMockedNgDefOf(
          ngModule.declarations[0],
          Target1Directive,
          'd',
        ),
      ).toBeTruthy();
    }
  });

  it('skips 2nd kept pipe', () => {
    const ngModule = ngMocks.guts(Target1Pipe, [
      Target1Pipe,
      Target1Pipe,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(ngModule.declarations[0]).toBe(Target1Pipe);
    }
  });

  it('skips the 2nd mock pipe', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Pipe,
      Target1Pipe,
    ]);
    expect(ngModule.declarations?.length).toEqual(1);
    if (ngModule.declarations) {
      expect(
        isMockedNgDefOf(ngModule.declarations[0], Target1Pipe, 'p'),
      ).toBeTruthy();
    }
  });

  it('skips 2nd kept service', () => {
    const ngModule = ngMocks.guts(Target1Service, [
      Target1Service,
      Target1Service,
    ]);
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toBe(Target1Service);
    }
  });

  it('skips the 2nd mock service', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      Target1Service,
      Target1Service,
    ]);
    expect(ngModule.providers?.length).toEqual(1);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        deps: [Injector],
        provide: Target1Service,
        useFactory: jasmine.anything(),
      });
    }
  });

  it('skips 2nd kept token', () => {
    const ngModule = ngMocks.guts(TARGET1, [
      {
        provide: TARGET1,
        useValue: 1,
      },
      {
        provide: TARGET1,
        useValue: 2,
      },
    ]);
    expect(ngModule.providers?.length).toEqual(2);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        provide: TARGET1,
        useValue: 1,
      });
      expect(ngModule.providers[1]).toEqual({
        provide: TARGET1,
        useValue: 2,
      });
    }
  });

  it('skips the 2nd mock token', () => {
    const ngModule = ngMocks.guts(TARGET2, [
      {
        provide: TARGET1,
        useValue: 1,
      },
      {
        provide: TARGET1,
        useValue: 2,
      },
    ]);
    expect(ngModule.providers?.length).toEqual(2);
    if (ngModule.providers) {
      expect(ngModule.providers[0]).toEqual({
        deps: [Injector],
        provide: TARGET1,
        useFactory: jasmine.anything(),
      });
      expect(ngModule.providers[0].useFactory()).toEqual(0);
      expect(ngModule.providers[1]).toEqual({
        deps: [Injector],
        provide: TARGET1,
        useFactory: jasmine.anything(),
      });
      expect(ngModule.providers[1].useFactory()).toEqual(0);
    }
  });

  it('skips the 2nd mock multi token', () => {
    const ngModule = ngMocks.guts(TARGET2, [
      {
        multi: true,
        provide: TARGET1,
        useValue: 1,
      },
      {
        multi: true,
        provide: TARGET1,
        useValue: 2,
      },
    ]);
    expect(ngModule.providers?.length).toEqual(0);
  });

  it('excludes 2nd nested kept module', () => {
    const ngModule = ngMocks.guts(Target2Module, [
      Target1Module,
      Target3Module,
    ]);
    expect(ngModule).toEqual(
      jasmine.objectContaining({
        imports: [CommonModule, Target2Module],
      }),
    );
  });

  it('excludes the 2nd mock kept module', () => {
    const ngModule = ngMocks.guts(null, [
      Target1Module,
      Target3Module,
    ]);
    expect(ngModule).toEqual(
      jasmine.objectContaining({
        imports: [CommonModule, getMockedNgDefOf(Target2Module)],
      }),
    );
  });

  it('ignores null values', () => {
    const ngModule = ngMocks.guts(null, null, null);
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('ignores duplicates values', () => {
    const ngModule = ngMocks.guts(
      [Target1Service, Target1Service],
      [Target1Module, Target1Module],
      [Target1Pipe, Target1Pipe],
    );
    expect(ngModule).toEqual({
      declarations: [
        getMockedNgDefOf(Target1Component),
        getMockedNgDefOf(Target1Directive),
      ],
      imports: [CommonModule, getMockedNgDefOf(Target2Module)],
      providers: [
        Target1Service,
        {
          deps: [Injector],
          provide: TARGET1,
          useFactory: jasmine.anything(),
        },
      ],
    });
  });

  it('excludes mock providers', () => {
    const ngModule = ngMocks.guts(
      null,
      Target1Service,
      Target1Service,
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes mock module with providers', () => {
    const ngModule = ngMocks.guts(
      null,
      { ngModule: Target1Module, providers: [] },
      Target1Module,
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes nested mock module', () => {
    const ngModule = ngMocks.guts(null, Target3Module, Target2Module);
    expect(ngModule).toEqual({
      declarations: [],
      imports: [CommonModule],
      providers: [],
    });
  });

  it('excludes nested kept module', () => {
    const ngModule = ngMocks.guts(
      Target2Module,
      Target3Module,
      Target2Module,
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [CommonModule],
      providers: [],
    });
  });

  it('excludes mock module', () => {
    const ngModule = ngMocks.guts(null, Target2Module, Target2Module);
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes mock component', () => {
    const ngModule = ngMocks.guts(
      null,
      Target1Component,
      Target1Component,
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes mock directive', () => {
    const ngModule = ngMocks.guts(
      null,
      Target1Directive,
      Target1Directive,
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes mock pipe', () => {
    const ngModule = ngMocks.guts(null, Target1Pipe, Target1Pipe);
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });

  it('excludes kept declarations', () => {
    const ngModule = ngMocks.guts(
      [
        Target1Module,
        Target1Component,
        Target1Directive,
        Target1Pipe,
        Target1Service,
        TARGET1,
      ],
      null,
      [
        Target1Module,
        Target1Component,
        Target1Directive,
        Target1Pipe,
        Target1Service,
        TARGET1,
      ],
    );
    expect(ngModule).toEqual({
      declarations: [],
      imports: [],
      providers: [],
    });
  });
});
