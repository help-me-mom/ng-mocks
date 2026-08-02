import decorateInputs from './decorate.inputs';

describe('decorateInputs', () => {
  it('preserves signal input metadata for Angular JIT', () => {
    class TargetComponent {}

    decorateInputs(TargetComponent, [
      {
        alias: 'alias',
        isSignal: true,
        name: 'value',
        transform: String,
      },
    ]);

    expect((TargetComponent as any).__prop__metadata__.value).toEqual(
      [
        jasmine.objectContaining({
          alias: 'alias',
          isSignal: true,
          transform: String,
        }),
      ],
    );
  });
});
