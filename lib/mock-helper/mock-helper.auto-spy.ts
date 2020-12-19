import { registerMockFunction } from '../mock-service/helper.mock-service';
import { CustomMockFunction } from '../mock-service/types';

type param = 'jasmine' | 'jest' | 'default' | 'reset' | CustomMockFunction;

const calls: param[] = [];

export default (type: param) => {
  if (type === 'reset') {
    calls.pop();
  } else {
    calls.push(type);
  }
  const action: param | undefined = calls[calls.length - 1];

  if (action === 'jasmine') {
    return registerMockFunction(mockName => jasmine.createSpy(mockName));
  }
  // istanbul ignore if: because it's run with jasmine
  if (action === 'jest') {
    return registerMockFunction(name => jest.fn().mockName(name));
  }
  if (!action || action === 'default' || action === 'reset') {
    return registerMockFunction();
  }

  return registerMockFunction(action);
};
