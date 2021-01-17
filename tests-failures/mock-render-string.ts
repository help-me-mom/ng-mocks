import { MockRender } from 'ng-mocks';

declare class TargetComponent {
  public readonly ro: string;
  public rw: string;
}

declare class WrongComponent {
  public readonly rw1: string;
}

// if we provide neither a type or params,
// the should be undefined.
const fixture1 = MockRender('test');
// @ts-expect-error: fails due to unknown type.
fixture1.componentInstance.rw = '123';
// @ts-expect-error: fails due to unknown type.
fixture1.componentInstance.rw = 123;
// @ts-expect-error: fails due to unknown type.
fixture1.componentInstance.ro = '123';
// does not fail because it is undefined.
fixture1.componentInstance = undefined;
// @ts-expect-error: fails because it is not defined
fixture1.point.componentInstance = new TargetComponent();
// @ts-expect-error: fails because it is not defined
fixture1.point.componentInstance = new WrongComponent();

// If we provide a type only, then it is direct proxy
// and both componentInstance and point should have its type.
const fixture2 = MockRender<TargetComponent>('test');
// componentInstance works
fixture2.componentInstance.rw = '123';
// @ts-expect-error: fails due to wrong type.
fixture2.componentInstance.rw = 123;
// @ts-expect-error: fails due to readonly.
fixture2.componentInstance.ro = '123';
// @ts-expect-error: fails because it is defined.
fixture2.componentInstance = undefined;
// does not fail because of the correct type
fixture2.point.componentInstance = new TargetComponent();
// @ts-expect-error: fails because of a wrong type
fixture2.point.componentInstance = new WrongComponent();

// TODO try to make it precise
// if we provide params only then point is undefined,
// and componentInstance is anything.
const fixture3 = MockRender('test', { k1: 123, k2: '123' });
fixture3.componentInstance.k1 = 123;
fixture3.componentInstance.k1 = '123';
fixture3.componentInstance.k2 = 123;
fixture3.componentInstance.k2 = '123';
fixture3.componentInstance.rw = '123';
fixture3.componentInstance.rw = 123;
fixture3.componentInstance.ro = '123';
// @ts-expect-error: fails because params are defined.
fixture3.componentInstance = undefined;
// @ts-expect-error: fails because it is not defined
fixture3.point.componentInstance = new TargetComponent();
// @ts-expect-error: fails because it is not defined
fixture3.point.componentInstance = new WrongComponent();

// TODO try to make it precise
// if we provide both, then componentInstance is anything,
// and point is the type.
const fixture4 = MockRender<TargetComponent>('test', { k1: 123, k2: '123' });
fixture4.componentInstance.k1 = 123;
fixture4.componentInstance.k1 = '123';
fixture4.componentInstance.k2 = 123;
fixture4.componentInstance.k2 = '123';
fixture4.componentInstance.rw = '123';
fixture4.componentInstance.rw = 123;
fixture4.componentInstance.ro = '123';
// does not fail because of the correct type
fixture4.point.componentInstance = new TargetComponent();
// @ts-expect-error: fails because of a wrong type
fixture4.point.componentInstance = new WrongComponent();

// if we provide both types, then componentInstance is the type,
// and point is a predefined type.
const fixture5 = MockRender<TargetComponent, { k1: number; k2: string }>('test', { k1: 123, k2: '123' });
fixture5.componentInstance.k1 = 123;
// @ts-expect-error: fails due to wrong type.
fixture5.componentInstance.k1 = '123';
// @ts-expect-error: fails due to wrong type.
fixture5.componentInstance.k2 = 123;
fixture5.componentInstance.k2 = '123';
// @ts-expect-error: fails due missed declaration.
fixture5.componentInstance.rw = '123';
// @ts-expect-error: fails due missed declaration.
fixture5.componentInstance.rw = 123;
// @ts-expect-error: fails due missed declaration.
fixture5.componentInstance.ro = '123';
// does not fail because of the correct type
fixture5.point.componentInstance = new TargetComponent();
// @ts-expect-error: fails because of a wrong type
fixture5.point.componentInstance = new WrongComponent();
