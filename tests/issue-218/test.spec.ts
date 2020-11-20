import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN_PREFIX = new InjectionToken('PREFIX');

@Injectable()
class PrefixService {
  public readonly prefix: string;

  public constructor(@Inject(TOKEN_PREFIX) prefix: string) {
    this.prefix = prefix;
  }
}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected prefix: string;

  public constructor(service: PrefixService) {
    this.prefix = service.prefix;
  }

  public transform(value: string): string {
    return `${this.prefix}:${value}`;
  }
}

@Component({
  selector: 'target',
  template: `{{ value | target }} - {{ piped }}`,
})
class TargetComponent implements OnInit {
  public piped: string;
  @Input() public value: string;

  protected pipe: TargetPipe;

  public constructor(pipe: TargetPipe) {
    this.pipe = pipe;
  }

  public ngOnInit(): void {
    this.piped = this.pipe.transform(this.value);
  }
}

@NgModule({
  declarations: [TargetComponent, TargetPipe],
  providers: [
    {
      provide: TOKEN_PREFIX,
      useValue: 'real',
    },
    PrefixService,
    TargetPipe,
  ],
})
class TargetModule {}

describe('issue-218:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('renders transformed strings', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('>real:test - real:test<');
  });
});

describe('issue-218:builder:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders emptiness', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('> - <');
  });
});

describe('issue-218:builder:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(TargetPipe));

  it('renders how we replaced it with a mock copy', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('>undefined:test - undefined:test<');
  });
});

describe('issue-218:guts:mock', () => {
  beforeEach(() => TestBed.configureTestingModule(ngMocks.guts(TargetComponent, TargetModule)).compileComponents());

  it('renders emptiness', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('> - <');
  });
});

describe('issue-218:guts:keep', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(ngMocks.guts([TargetComponent, TargetPipe], TargetModule)).compileComponents(),
  );

  it('renders how we replaced it with a mock copy', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('>undefined:test - undefined:test<');
  });
});
