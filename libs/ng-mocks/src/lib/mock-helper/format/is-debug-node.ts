import { MockedDebugNode } from '../../mock-render/types';

export default (value: any): value is MockedDebugNode => {
  return !!value?.nativeElement || !!value?.nativeNode;
};
