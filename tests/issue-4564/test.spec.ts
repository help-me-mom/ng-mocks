import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockModule,
  MockPipe,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Injectable()
class TargetService {
  func() {
    return 'real';
  }
}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  transform() {
    return 'real';
  }
}

@Pipe({
  name: 'standard',
})
class StandardPipe implements PipeTransform {
  transform() {
    return 'standard';
  }
}

@NgModule({
  declarations: [TargetPipe, StandardPipe],
  exports: [TargetPipe, StandardPipe],
  providers: [
    {
      provide: TOKEN,
      useValue: 'real',
    },
    TargetService,
  ],
})
class PipeModule {}

@Component({
  selector: 'target-4564',
  template: '{{ null | target }}:{{ token }}:{{ service.func() }}',
})
class TargetComponent {
  constructor(
    @Inject(TOKEN) public readonly token: string,
    public readonly service: TargetService,
  ) {}
}

@NgModule({
  imports: [PipeModule],
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class ComponentModule {}

@Component({
  selector: 'sut',
  template:
    '<custom-component><target-4564></target-4564></custom-component>',
})
class SubjectUnderTestComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4564
// mixed imports forget pipe customizations.
describe('issue-4564', () => {
  ngMocks.throwOnConsole();

  describe('issue', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [ComponentModule, MockModule(PipeModule)],
        declarations: [
          SubjectUnderTestComponent,
          MockPipe(TargetPipe, () => 'mock'),
          MockPipe(StandardPipe),
        ],
        providers: [
          MockProvider(TOKEN, 'mock'),
          MockProvider(TargetService, {
            func: () => 'mock',
          }),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents(),
    );

    it('customizes pipes', () => {
      const fixture = MockRender(SubjectUnderTestComponent);
      expect(ngMocks.formatText(fixture)).toEqual('mock:mock:mock');
    });
  });

  describe('only mock imports', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [
          MockModule(ComponentModule),
          MockModule(PipeModule),
        ],
        declarations: [
          TargetComponent,
          SubjectUnderTestComponent,
          MockPipe(TargetPipe, () => 'mock'),
          MockPipe(StandardPipe),
        ],
        providers: [
          MockProvider(TOKEN, 'mock'),
          MockProvider(TargetService, {
            func: () => 'mock',
          }),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents(),
    );

    it('customizes pipes', () => {
      const fixture = MockRender(SubjectUnderTestComponent);
      expect(ngMocks.formatText(fixture)).toEqual('mock:mock:mock');
    });
  });
});
