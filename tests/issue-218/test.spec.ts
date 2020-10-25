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

  constructor(@Inject(TOKEN_PREFIX) prefix: string) {
    this.prefix = prefix;
  }
}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected prefix: string;

  constructor(service: PrefixService) {
    this.prefix = service.prefix;
  }

  transform(value: string): string {
    return `${this.prefix}:${value}`;
  }
}

@Component({
  selector: 'target',
  template: `{{ value | target }} - {{ piped }}`,
})
class TargetComponent implements OnInit {
  public piped: string;
  @Input() value: string;

  protected pipe: TargetPipe;

  constructor(pipe: TargetPipe) {
    this.pipe = pipe;
  }

  ngOnInit(): void {
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

describe('issue-218:mock-all', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders emptiness', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('> - <');
  });
});

describe('issue-218:guts', () => {
  beforeEach(() => TestBed.configureTestingModule(ngMocks.guts(TargetComponent, TargetModule)).compileComponents());

  it('renders emptiness', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('> - <');
  });
});

describe('issue-218:keep-pipe', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(TargetPipe));

  it('renders how we mocked it', () => {
    const fixture = MockRender(TargetComponent, {
      value: 'test',
    });

    expect(fixture.nativeElement.innerHTML).toContain('>undefined:test - undefined:test<');
  });
});
