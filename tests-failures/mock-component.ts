import { MockComponent, MockComponents } from 'ng-mocks';

class MyComponent {}

abstract class AbstractComponent {}

// Any class works well.
MockComponent(MyComponent);
MockComponents(MyComponent);

// @ts-expect-error: does not accept an abstract component.
MockComponent(AbstractComponent);

// @ts-expect-error: does not accept an abstract component.
MockComponents(AbstractComponent);
