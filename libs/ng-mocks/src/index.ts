// istanbul ignore file

import './lib/common/ng-mocks-stack';
import './lib/common/ng-mocks-global-overrides';

export * from './lib/common/core.tokens';

export { getTestBedInjection, getInjection } from './lib/common/core.helpers';

export { getMockedNgDefOf } from './lib/common/func.get-mocked-ng-def-of';
export { getSourceOfMock } from './lib/common/func.get-source-of-mock';
export { isMockControlValueAccessor } from './lib/common/func.is-mock-control-value-accessor';
export { isMockNgDef } from './lib/common/func.is-mock-ng-def';
export { isMockOf } from './lib/common/func.is-mock-of';
export { isMockValidator } from './lib/common/func.is-mock-validator';
export { isMockedNgDefOf } from './lib/common/func.is-mocked-ng-def-of';
export { isNgDef } from './lib/common/func.is-ng-def';
export { isNgInjectionToken } from './lib/common/func.is-ng-injection-token';

export { Mock } from './lib/common/mock';
export {
  MockControlValueAccessor,
  MockValidator,
  LegacyControlValueAccessor,
} from './lib/common/mock-control-value-accessor';
export { MockInstance, MockReset } from './lib/mock-instance/mock-instance';

export { MockBuilder } from './lib/mock-builder/mock-builder';
export {
  IMockBuilder,
  IMockBuilderExtended,
  IMockBuilderConfig,
  IMockBuilderConfigAll,
  IMockBuilderConfigComponent,
  IMockBuilderConfigDirective,
  IMockBuilderConfigModule,
  IMockBuilderResult,
} from './lib/mock-builder/types';

export { MockModule } from './lib/mock-module/mock-module';
export { MockedModule } from './lib/mock-module/types';

export { MockComponent, MockComponents } from './lib/mock-component/mock-component';
export { MockedComponent } from './lib/mock-component/types';

export { MockDirective, MockDirectives } from './lib/mock-directive/mock-directive';
export { MockedDirective } from './lib/mock-directive/types';

export { MockPipe, MockPipes } from './lib/mock-pipe/mock-pipe';
export { MockedPipe } from './lib/mock-pipe/types';

export { MockDeclaration, MockDeclarations } from './lib/mock-declaration/mock-declaration';

export { MockProvider, MockProviders } from './lib/mock-provider/mock-provider';

export { MockService } from './lib/mock-service/mock-service';

export { ngMocks } from './lib/mock-helper/mock-helper';

export { MockRender } from './lib/mock-render/mock-render';
export { MockRenderFactory } from './lib/mock-render/mock-render-factory';
export * from './lib/mock-render/types';

export * from './lib/mock-service/types';
