// It has to be an interface.
// tslint:disable-next-line:interface-name
export interface AbstractType<T> extends Function {
  prototype: T;
}

// It has to be an interface.
// tslint:disable-next-line:interface-name
export interface Type<T> extends Function {
  // tslint:disable-next-line:callable-types
  new (...args: any[]): T;
}

export type AnyType<T> = Type<T> | AbstractType<T>;
