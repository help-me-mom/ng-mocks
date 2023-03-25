import { CommonModule } from '@angular/common';
import {
  Component,
  Directive,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MockDirective,
  MockModule,
  MockPipe,
  MockService,
  ngMocks,
} from 'ng-mocks';

const TARGET1 = new InjectionToken('TARGET1');

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
  selector: 'target2-ng-mocks-guts',
  template: '<ng-content></ng-content>',
})
class Target2Component {}

@Component({
  selector: 'target1-ng-mocks-guts',
  template: `<div (target1)="update.emit()">
    {{ greeting }} {{ greeting | target1 }}
    <target2-ng-mocks-guts>{{ target }}</target2-ng-mocks-guts>
  </div>`,
})
class Target1Component {
  @Input() public greeting: string | null = null;
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
    this.service.callback = () => {
      this.target1.emit();
    };
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

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ngMocks.guts:NO_ERRORS_SCHEMA', () => {
  let fixture: ComponentFixture<Target1Component>;
  let component: Target1Component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Target1Component, Target1Pipe],
      imports: [CommonModule],
      providers: [
        {
          provide: TARGET1,
          useValue: 'target1',
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(Target1Component);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    expect(component).toEqual(assertion.any(Target1Component));
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target2-ng-mocks-guts></target2-ng-mocks-guts>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain('hello');
    component.greeting = 'hello';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('hello');
  });
});

describe('ngMocks.guts:legacy', () => {
  let fixture: ComponentFixture<Target1Component>;
  let component: Target1Component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockPipe(Target1Pipe),
        MockDirective(Target1Directive),
        Target1Component,
      ],
      imports: [CommonModule, MockModule(Target2Module)],
      providers: [
        {
          provide: Target1Service,
          useValue: MockService(Target1Service),
        },
        {
          provide: TARGET1,
          useValue: undefined,
        },
      ],
    });
    fixture = TestBed.createComponent(Target1Component);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    expect(component).toEqual(assertion.any(Target1Component));
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target2-ng-mocks-guts></target2-ng-mocks-guts>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain('hello');
    component.greeting = 'hello';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('hello');
  });
});

describe('ngMocks.guts:normal', () => {
  let fixture: ComponentFixture<Target1Component>;
  let component: Target1Component;

  beforeEach(() => {
    TestBed.configureTestingModule(
      ngMocks.guts(Target1Component, Target1Module),
    );
    fixture = TestBed.createComponent(Target1Component);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    expect(component).toEqual(assertion.any(Target1Component));
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target2-ng-mocks-guts></target2-ng-mocks-guts>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain('hello');
    component.greeting = 'hello';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('hello');
  });
});
