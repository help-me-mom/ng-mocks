import { InputSignal, InputSignalWithTransform, ModelSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

type ExtractWithTransform<TValue> = TValue extends InputSignalWithTransform<any, infer R> ? R : never;
type ExtractModelType<TValue> = TValue extends ModelSignal<infer R> ? R : ExtractWithTransform<TValue>;
type ExtractInputType<TValue> = TValue extends InputSignal<infer R> ? R : ExtractModelType<TValue>;

type ExtractComponentInputs<TComponent> = {
  [K in keyof TComponent as ExtractInputType<TComponent[K]> extends never ? never : K]: ExtractInputType<TComponent[K]>;
};

export default <TComponent, TKey extends keyof ExtractComponentInputs<TComponent>>(
  fixture: ComponentFixture<TComponent>,
  inputProperty: TKey,
  value: ExtractComponentInputs<TComponent>[TKey],
): void => {
  fixture.componentRef.setInput(inputProperty as string, value);
};
