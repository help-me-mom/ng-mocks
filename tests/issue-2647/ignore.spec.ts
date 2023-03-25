import {
  Component,
  Directive,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

// @TODO remove with A5 support
const injectableRootServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableRootServiceArgs)
class RootService {}

@Injectable()
class MissingService {}

@Pipe({
  name: 'missing',
})
class MissingPipe implements PipeTransform {
  constructor(public readonly missing: MissingService) {}

  transform(): string {
    return this.constructor.name;
  }
}

@Directive({
  selector: 'missing',
})
class MissingDirective {
  constructor(public readonly missing: MissingService) {}
}

@Component({
  selector: 'missing',
  template: 'missing',
})
class MissingComponent {
  constructor(public readonly missing: MissingService) {}
}

@NgModule({})
class MissingModule {}

@Injectable()
class TargetService {
  constructor(public readonly root: RootService) {}
}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  constructor(
    public readonly target: TargetService,
    public readonly root: RootService,
  ) {}

  transform(): string {
    return this.constructor.name;
  }
}

@Directive({
  selector: 'target-2647-ignore',
})
class TargetDirective {
  constructor(
    public readonly target: TargetService,
    public readonly root: RootService,
  ) {}
}

@Component({
  selector: 'target-2647-ignore',
  template: 'target',
})
class TargetComponent {
  constructor(
    public readonly target: TargetService,
    public readonly root: RootService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
  providers: [TargetService],
})
class TargetModule {}

describe('issue-2647:ignore', () => {
  let consoleWarn: typeof console.warn;

  beforeAll(() =>
    ngMocks.config({
      onMockBuilderMissingDependency: 'i-know-but-disable',
    }),
  );
  beforeAll(() => (consoleWarn = console.warn));

  beforeEach(() => {
    console.warn =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
  });

  afterAll(() => {
    console.warn = consoleWarn;
    ngMocks.config({
      onMockBuilderMissingDependency: null,
    });
  });

  describe('strict', () => {
    describe('.keep', () => {
      it('throws on missing provided service', () => {
        const builder = MockBuilder(TargetService, TargetModule).keep(
          MissingService,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(TargetService, TargetModule).keep(
          RootService,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe, TargetModule).keep(
          MissingPipe,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing directive', () => {
        const builder = MockBuilder(
          TargetDirective,
          TargetModule,
        ).keep(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing component', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).keep(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing module', () => {
        const builder = MockBuilder(TargetModule, []).keep(
          MissingModule,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });

    describe('.mock', () => {
      it('throws on missing provided service', () => {
        const builder = MockBuilder(TargetService, TargetModule).mock(
          MissingService,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(TargetService, TargetModule).mock(
          RootService,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe, TargetModule).mock(
          MissingPipe,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing directive', () => {
        const builder = MockBuilder(
          TargetDirective,
          TargetModule,
        ).mock(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing component', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).mock(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('throws on missing module', () => {
        const builder = MockBuilder(TargetModule, []).mock(
          MissingModule,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });

    describe('.exclude', () => {
      it('succeeds on missing provided service', () => {
        const builder = MockBuilder(
          TargetService,
          TargetModule,
        ).exclude(MissingService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(
          TargetService,
          TargetModule,
        ).exclude(RootService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe, TargetModule).exclude(
          MissingPipe,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing directive', () => {
        const builder = MockBuilder(
          TargetDirective,
          TargetModule,
        ).exclude(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing component', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).exclude(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing module', () => {
        const builder = MockBuilder(TargetModule, []).exclude(
          MissingModule,
        );

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('flex', () => {
    describe('.keep', () => {
      it('succeeds on missing provided service', () => {
        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .keep(MissingService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .keep(RootService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe)
          .mock(TargetModule)
          .keep(MissingPipe);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing directive', () => {
        const builder = MockBuilder(TargetDirective)
          .mock(TargetModule)
          .keep(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing component', () => {
        const builder = MockBuilder(TargetComponent)
          .mock(TargetModule)
          .keep(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing module', () => {
        const builder = MockBuilder(TargetModule).keep(MissingModule);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });

    describe('.mock', () => {
      it('succeeds on missing provided service', () => {
        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .mock(MissingService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .mock(RootService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe)
          .mock(TargetModule)
          .mock(MissingPipe);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing directive', () => {
        const builder = MockBuilder(TargetDirective)
          .mock(TargetModule)
          .mock(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing component', () => {
        const builder = MockBuilder(TargetComponent)
          .mock(TargetModule)
          .mock(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing module', () => {
        const builder = MockBuilder(TargetModule).mock(MissingModule);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });

    describe('.exclude', () => {
      it('succeeds on missing provided service', () => {
        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .exclude(MissingService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on root service', () => {
        if (Number.parseInt(VERSION.major, 10) <= 5) {
          // @TODO pending('Need Angular > 5');
          expect(true).toBeTruthy();

          return;
        }

        const builder = MockBuilder(TargetService)
          .mock(TargetModule)
          .exclude(RootService);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing pipe ', () => {
        const builder = MockBuilder(TargetPipe)
          .mock(TargetModule)
          .exclude(MissingPipe);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing directive', () => {
        const builder = MockBuilder(TargetDirective)
          .mock(TargetModule)
          .exclude(MissingDirective);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing component', () => {
        const builder = MockBuilder(TargetComponent)
          .mock(TargetModule)
          .exclude(MissingComponent);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('succeeds on missing module', () => {
        const builder =
          MockBuilder(TargetModule).exclude(MissingModule);

        expect(console.warn).not.toHaveBeenCalled();
        builder.build();
        expect(console.warn).not.toHaveBeenCalled();
      });
    });
  });
});
