import { ngMocks } from 'ng-mocks';

declare class MyService {
  public readonly name: string;
  public echo(): string;
}

declare abstract class AbstractService {
  public readonly name: string;
  public abstract echo(): string;
}

declare const instance: MyService;
declare const abstractInstance: AbstractService;

ngMocks.stub(instance, 'echo');
ngMocks.stub(instance, 'name', 'get');
ngMocks.stub(instance, 'name', 'set');

ngMocks.stub(abstractInstance, 'echo');
ngMocks.stub(abstractInstance, 'name', 'get');
ngMocks.stub(abstractInstance, 'name', 'set');

// TODO get it failing
ngMocks.stub(instance, 'name');
ngMocks.stub(abstractInstance, 'name');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(instance, 'unknown');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(instance, 'unknown1', 'get');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(instance, 'unknown2', 'set');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(abstractInstance, 'unknown');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(abstractInstance, 'unknown1', 'get');

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(abstractInstance, 'unknown2', 'set');

// Accepts a properly typed mock copy.
ngMocks.stub(instance, {
  name: '123',
});
ngMocks.stub(instance, {
  echo: () => '123',
});
ngMocks.stub(instance, {
  echo: () => '123',
  name: '123',
});

// Accepts a properly typed mock copy.
ngMocks.stub(abstractInstance, {
  name: '123',
});
ngMocks.stub(abstractInstance, {
  echo: () => '123',
});
ngMocks.stub(abstractInstance, {
  echo: () => '123',
  name: '123',
});

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(instance, {
  name1: '123',
});

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(instance, {
  name: 123,
});

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(abstractInstance, {
  name1: '123',
});

// @ts-expect-error: does not accept wrong properties.
ngMocks.stub(abstractInstance, {
  name: 123,
});
