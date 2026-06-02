import type { MockedDebugNode } from '../../mock-render/types.common';

export default (value: any): value is MockedDebugNode => {
  return !!value?.nativeElement || !!value?.nativeNode;
};
