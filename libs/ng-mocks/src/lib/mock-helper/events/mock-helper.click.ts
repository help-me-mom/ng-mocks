import { DebugNodeSelector } from '../../common/core.types';

import mockHelperTrigger from './mock-helper.trigger';

export default (selector: DebugNodeSelector, payload?: object) => {
  mockHelperTrigger(selector, 'click', payload);
};
