import mockHelperTrigger from './mock-helper.trigger';

export default (selector: any, payload?: object) => {
  mockHelperTrigger(selector, 'click', payload);
};
