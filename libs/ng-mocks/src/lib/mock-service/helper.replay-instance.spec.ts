import helperReplayInstance from './helper.replay-instance';

describe('helper.replay-instance', () => {
  it('returns early for empty or identical instances', () => {
    const instance = {};

    expect(() =>
      helperReplayInstance(undefined, instance),
    ).not.toThrow();
    expect(() =>
      helperReplayInstance(instance, instance),
    ).not.toThrow();
  });

  it('copies symbol descriptors and skips internal keys', () => {
    // Replay should preserve user-configured descriptors while leaving Angular internals alone.
    const symbol = Symbol('value');
    const seed: Record<keyof any, any> = {};
    const target: Record<keyof any, any> = {};

    Object.defineProperty(seed, symbol, {
      configurable: true,
      value: 'symbol',
    });
    Object.defineProperty(seed, '__ngContext__', {
      configurable: true,
      value: 'skip',
    });
    Object.defineProperty(seed, 'locked', {
      configurable: false,
      value: 'skip',
    });

    helperReplayInstance(seed, target);

    expect(target[symbol]).toEqual('symbol');
    expect(target.__ngContext__).toBeUndefined();
    expect(target.locked).toBeUndefined();
  });
});
