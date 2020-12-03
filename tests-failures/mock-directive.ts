import { MockDirective, MockDirectives } from 'ng-mocks';

class MyDirective {}

abstract class AbstractDirective {}

// Any class works well.
MockDirective(MyDirective);
MockDirectives(MyDirective);

// @ts-expect-error: does not accept an abstract directive.
MockDirective(AbstractDirective);

// @ts-expect-error: does not accept an abstract directive.
MockDirectives(AbstractDirective);
