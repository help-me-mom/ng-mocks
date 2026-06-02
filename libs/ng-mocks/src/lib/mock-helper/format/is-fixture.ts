import { MockedDebugNode } from '../../mock-render/types';

export default (value: any): value is { debugElement: MockedDebugNode } => {
  return !!value && typeof value === 'object' && value.debugElement !== undefined;
};
