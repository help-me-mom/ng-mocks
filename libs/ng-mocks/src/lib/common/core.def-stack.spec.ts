import CoreDefStack from './core.def-stack';

describe('CoreDefStack', () => {
  it('returns empty map on empty pop', () => {
    const stack = new CoreDefStack();

    const result1 = stack.pop();
    const result2 = stack.pop();

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1).not.toBe(result2);
  });

  it('returns undefined on empty get', () => {
    const stack = new CoreDefStack();
    expect(stack.get(CoreDefStack)).toBeUndefined();
  });
});
