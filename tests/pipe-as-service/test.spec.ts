import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
  ngMocks,
} from 'ng-mocks';

@Pipe({
  name: 'target',
})
@Injectable()
class TargetPipe implements PipeTransform {
  public readonly name: string = 'target';

  public echo(): string {
    return this.name;
  }

  public transform(...args: any[]): string {
    return this.name ? JSON.stringify(args) : '';
  }
}

@Component({
  selector: 'target-pipe-as-service',
  template: `
    'pipe:{{ '123' | target }}' 's:transform:{{
      service.transform('123')
    }}' 's:name:{{ service.name }}' 's:echo:{{ service.echo() }}'
  `,
})
class TargetComponent {
  public constructor(public readonly service: TargetPipe) {}
}

@NgModule({
  declarations: [TargetPipe, TargetComponent],
  exports: [TargetComponent],
  providers: [TargetPipe],
})
class TargetModule {}

describe('pipe-as-service', () => {
  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '\'pipe:["123"]\'',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '\'s:transform:["123"]\'',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:name:target'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:echo:target'",
      );
    });
  });

  describe('guts', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetComponent, TargetModule),
      ),
    );

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain("'pipe:'");
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:'",
      );
      expect(fixture.nativeElement.innerHTML).toContain("'s:name:'");
      expect(fixture.nativeElement.innerHTML).toContain("'s:echo:'");
    });
  });

  describe('guts:mock-instance', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(TargetComponent, TargetModule),
      ),
    );

    beforeAll(() =>
      MockInstance(TargetPipe, instance =>
        ngMocks.stub(instance, {
          echo: () => 'echo',
          name: 'mock',
          transform: () => 'transform',
        }),
      ),
    );
    afterAll(MockReset);

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        "'pipe:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:name:mock'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:echo:echo'",
      );
    });
  });

  describe('mock-builder', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain("'pipe:'");
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:'",
      );
      expect(fixture.nativeElement.innerHTML).toContain("'s:name:'");
      expect(fixture.nativeElement.innerHTML).toContain("'s:echo:'");
    });
  });

  describe('mock-builder:mock-instance', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    beforeAll(() =>
      MockInstance(TargetPipe, instance =>
        ngMocks.stub(instance, {
          echo: () => 'echo',
          name: 'mock',
          transform: () => 'transform',
        }),
      ),
    );
    afterAll(MockReset);

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        "'pipe:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:name:mock'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:echo:echo'",
      );
    });
  });

  describe('mock-builder:pipe-function', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TargetPipe,
        () => 'transform',
      ),
    );

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        "'pipe:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain("'s:name:'");
      expect(fixture.nativeElement.innerHTML).toContain("'s:echo:'");
    });
  });

  describe('mock-builder:pipe-mock-cut', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TargetPipe,
        {
          name: 'test',
          transform: () => 'transform',
        },
        { precise: true },
      ),
    );

    it('fails because of the missed function', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /.echo is not a function|Object doesn't support property or method 'echo'/,
      );
    });
  });

  describe('mock-builder:pipe-mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(TargetPipe, {
        echo: () => 'echo',
        name: 'test',
        transform: () => 'transform',
      }),
    );

    it('renders correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        "'pipe:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:transform:transform'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:name:test'",
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        "'s:echo:echo'",
      );
    });
  });
});
