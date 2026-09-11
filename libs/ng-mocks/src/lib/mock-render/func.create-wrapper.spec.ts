import funcCreateWrapper from './func.create-wrapper';
import funcInstallPropReader from './func.install-prop-reader';

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
    expect(instance.value).toEqual('signal-default');
    expect(signalNode.transformFn('signal-default')).toEqual(
      'signal-default',
    );
    expect(signalNode.transformFn).toBe(transform);

    instance.publicValue = 'updated';
    expect(instance.publicValue).toEqual('updated');
    expect(instance.value).toEqual('updated');

    instance.value = 'original-name';
    expect(instance.publicValue).toEqual('original-name');
    expect(instance.__ngMocksPoint.value).toBe(targetInput);
  });

  it('reserves public input names while preserving ordinary input mirrors', () => {
    class TargetComponent {}

    const Wrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          {
            alias: 'publicValue',
            isSignal: true,
            name: 'value',
          },
          {
            alias: 'otherValue',
            isSignal: true,
            name: 'publicValue',
          },
          'classic:publicClassic',
        ],
        selector: 'target-14894-collision',
      } as any,
      undefined,
      {},
    );
    const instance: any = new Wrapper();
    const target = { classic: 'classic-default' };
    funcInstallPropReader(instance, target, []);

    instance.publicValue = 'first';
    instance.otherValue = 'second';
    expect(instance.value).toEqual('first');
    expect(instance.publicValue).toEqual('first');
    expect(instance.otherValue).toEqual('second');

    instance.value = 'updated';
    expect(instance.publicValue).toEqual('updated');
    expect(instance.otherValue).toEqual('second');

    expect(instance.classic).toEqual('classic-default');
    instance.classic = 'classic-updated';
    expect(target.classic).toEqual('classic-updated');
    expect(instance.publicClassic).toBeNull();
  });

  it('keeps explicit params and empty binding lists independent of original input names', () => {
    class TargetComponent {}

    const BoundWrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          {
            alias: 'publicValue',
            isSignal: true,
            name: 'value',
          },
        ],
        selector: 'target-14894-explicit',
      } as any,
      ['publicValue'],
      {},
    );
    const bound: any = new BoundWrapper();
    const params = { publicValue: 'initial' };
    funcInstallPropReader(
      bound,
      params,
      ['publicValue'],
      false,
      BoundWrapper.inputBindings,
    );

    expect(bound.publicValue).toEqual('initial');
    expect(
      Object.getOwnPropertyDescriptor(bound, 'value'),
    ).toBeUndefined();
    bound.publicValue = 'updated';
    expect(params.publicValue).toEqual('updated');
    params.publicValue = 'from-params';
    expect(bound.publicValue).toEqual('from-params');

    const UnboundWrapper: any = funcCreateWrapper(
      TargetComponent,
      {
        inputs: [
          {
            alias: 'publicValue',
            isSignal: true,
            name: 'value',
          },
        ],
        selector: 'target-14894-explicit',
      } as any,
      [],
      {},
    );
    const unbound: any = new UnboundWrapper();

    expect(
      Object.getOwnPropertyDescriptor(unbound, 'value'),
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(unbound, 'publicValue'),
    ).toBeUndefined();
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
