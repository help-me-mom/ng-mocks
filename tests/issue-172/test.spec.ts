import {
  Component,
  Injectable,
  NgModule,
  OnInit,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class Target1Service {
  protected readonly name = 'Target1Service';

  public echo(): string {
    return this.name;
  }
}

@Injectable()
class Target2Service {
  protected readonly name = 'Target2Service';

  public echo(): string {
    return this.name;
  }
}

@Component({
  providers: [Target1Service, Target2Service],
  selector: 'app-target',
  template: '{{echo}}',
})
class TargetComponent implements OnInit {
  public echo = '';

  public constructor(
    protected readonly target1Service: Target1Service,
    protected readonly target2Service: Target2Service,
  ) {}

  public ngOnInit(): void {
    this.echo = `${this.target1Service.echo()}${this.target2Service.echo()}`;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/172
describe('issue-172:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('renders echo', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<app-target>Target1ServiceTarget2Service</app-target>',
    );
  });
});

// @see https://github.com/ike18t/ng-mocks/issues/172
describe('issue-172:test', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('renders echo', () => {
    TestBed.overrideComponent(TargetComponent, {
      add: {
        providers: [
          {
            provide: Target1Service,
            useValue: {
              echo: () => 'MockService',
            },
          },
        ],
      },
      remove: {
        providers: [Target1Service],
      },
    });
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<app-target>MockServiceTarget2Service</app-target>',
    );
  });
});

// @see https://github.com/ike18t/ng-mocks/issues/172
describe('issue-172:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).mock(Target1Service, {
      echo: () => 'MockService',
    }),
  );

  it('renders the mock echo', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<app-target>MockServiceTarget2Service</app-target>',
    );
  });
});

// @see https://github.com/ike18t/ng-mocks/issues/172
describe('issue-172:restore', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('renders echo', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<app-target>Target1ServiceTarget2Service</app-target>',
    );
  });
});
