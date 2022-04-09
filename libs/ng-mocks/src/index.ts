// istanbul ignore file

import './lib/common/ng-mocks-stack';
import './lib/common/ng-mocks-global-overrides';

export { getTestBedInjection, getInjection } from './lib/common/core.helpers';
export * from './lib/common/core.tokens';
export * from './lib/common/core.types';
export * from './lib/common/func.get-mocked-ng-def-of';
export * from './lib/common/func.get-source-of-mock';
export * from './lib/common/func.is-mock-control-value-accessor';
export * from './lib/common/func.is-mock-ng-def';
export * from './lib/common/func.is-mock-of';
export * from './lib/common/func.is-mock-validator';
export * from './lib/common/func.is-mocked-ng-def-of';
export * from './lib/common/func.is-ng-def';
export * from './lib/common/func.is-ng-injection-token';
export * from './lib/common/func.is-ng-type';
export { Mock } from './lib/common/mock';
export { MockControlValueAccessor, MockValidator } from './lib/common/mock-control-value-accessor';

export * from './lib/mock-builder/mock-builder';
export * from './lib/mock-builder/types';

export * from './lib/mock-component/mock-component';
export * from './lib/mock-component/types';

export * from './lib/mock-declaration/mock-declaration';

export * from './lib/mock-directive/mock-directive';
export * from './lib/mock-directive/types';

export * from './lib/mock-helper/mock-helper';

export * from './lib/mock-instance/mock-instance';

export * from './lib/mock-module/mock-module';
export * from './lib/mock-module/types';

export * from './lib/mock-pipe/mock-pipe';
export * from './lib/mock-pipe/types';

export * from './lib/mock-provider/mock-provider';

export * from './lib/mock-render/mock-render';
export * from './lib/mock-render/mock-render-factory';
export * from './lib/mock-render/types';

export { registerMockFunction } from './lib/mock-service/helper.mock-service';
export * from './lib/mock-service/mock-service';
export * from './lib/mock-service/types';
