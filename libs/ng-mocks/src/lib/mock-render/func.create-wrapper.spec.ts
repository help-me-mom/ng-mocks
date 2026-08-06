import funcCreateWrapper from './func.create-wrapper';

describe('funcCreateWrapper', () => {
  it('uses signal defaults until the wrapper input is changed', () => {
    class TargetComponent {}

    const transform = (value: string) => `${value}-transformed`;
    const signalNode: any = {
      applyValueToInputSignal: () => undefined,
      transformFn: transform,
    };
    const targetInput = () => 'signal-default';
    Object.defineProperty(targetInput, Symbol('empty'), {
      value: null,
    });
    Object.defineProperty(targetInput, Symbol('primitive'), {
      value: () => undefined,
    });
    Object.defineProperty(targetInput, Symbol('no-transform'), {
      value: { applyValueToInputSignal: () => undefined },
    });
    Object.defineProperty(targetInput, Symbol('no-apply'), {
      value: {
        applyValueToInputSignal: null,
        transformFn: transform,
      },
    });
    Object.defineProperty(targetInput, Symbol('signal'), {
      value: signalNode,
    });

    const Wrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          {
            alias: 'publicValue',
            isSignal: true,
            name: 'value',
          },
        ],
        selector: 'target-11101-default',
      } as any,
      undefined,
      {},
    );
    const instance: any = new Wrapper();
    instance.__ngMocksPoint = { value: targetInput };

    expect(instance.publicValue).toEqual('signal-default');
    expect(signalNode.transformFn('signal-default')).toEqual(
      'signal-default',
    );
    expect(signalNode.transformFn).toBe(transform);

    instance.publicValue = 'updated';
    expect(instance.publicValue).toEqual('updated');
  });

  it('keeps the null binding for required signal inputs', () => {
    class TargetComponent {}

    const signalNode = {
      applyValueToInputSignal: () => undefined,
      transformFn: undefined,
    };
    const targetInput = () => {
      throw new Error('Required signal has no value');
    };
    Object.defineProperty(targetInput, Symbol('signal'), {
      value: signalNode,
    });

    const Wrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          {
            isSignal: true,
            name: 'required',
            required: true,
          },
        ],
        selector: 'target-11101-required',
      } as any,
      undefined,
      {},
    );
    const instance: any = new Wrapper();
    instance.__ngMocksPoint = { required: targetInput };

    expect(instance.required).toBeNull();
    expect(instance.required).toBeNull();
  });

  it('waits until the rendered signal input is available', () => {
    class TargetComponent {}

    const Wrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          { isSignal: true, name: 'missing' },
          { isSignal: true, name: 'notSignal' },
        ],
        selector: 'target-11101-missing',
      } as any,
      undefined,
      {},
    );
    const instance: any = new Wrapper();

    expect(instance.missing).toBeNull();

    instance.__ngMocksPoint = {
      missing: () => 'missing-node',
      notSignal: null,
    };
    expect(instance.missing).toBeNull();
    expect(instance.notSignal).toBeNull();
  });
});
