import helperExtractClassProperties from './helper.extract-class-properties';

describe('helper.extract-class-properties', () => {
  it('extracts inline class field shapes without running the constructor', () => {
    let constructorCalls = 0;

    class TargetClass {
      public readonly info = {
        nested: {
          work: async () => 'work',
        },
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        request: function request() {
          return 'request';
        },
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        send() {
          return 'send';
        },
        /*
         * Arrays keep their shape but not their real contents.
         */
        items: [1, 2, 3],
      };
      public readonly label = 'target';
      public readonly refresh = (value: string) => value;

      public constructor() {
        constructorCalls += 1;
      }
    }

    const properties = helperExtractClassProperties(TargetClass);

    expect(constructorCalls).toEqual(0);
    expect(properties.info.items).toEqual([]);
    expect(typeof properties.info.request).toEqual('function');
    expect(typeof properties.info.send).toEqual('function');
    expect(typeof properties.info.nested.work).toEqual('function');
    expect(typeof properties.refresh).toEqual('function');
    expect(properties.label).toBeUndefined();
  });

  it('extracts downleveled and bracketed assignments', () => {
    let constructorCalls = 0;

    // This is a class-shaped ES5 constructor fixture, not a test helper.
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function TargetClass(this: any) {
      this.marker = 'target';
      this['info'] = {
        request: () => 'request',
      };
      constructorCalls += 1;
    }

    const properties = helperExtractClassProperties(TargetClass);

    expect(constructorCalls).toEqual(0);
    expect(typeof properties.info.request).toEqual('function');
    expect(properties.marker).toBeUndefined();
  });

  it('ignores classes without a compiled constructor', () => {
    class TargetClass {}

    expect(helperExtractClassProperties(TargetClass)).toEqual({});
  });
});
