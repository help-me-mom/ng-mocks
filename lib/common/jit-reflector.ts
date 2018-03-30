import { CompileReflector, ExternalReference } from '@angular/compiler';
import { Component, ɵReflectionCapabilities as ReflectionCapabilities, ɵstringify as stringify } from '@angular/core';

export class JitReflector implements CompileReflector {
  private readonly _reflectionCapabilities: ReflectionCapabilities;

  constructor() {
    this._reflectionCapabilities = new ReflectionCapabilities();
  }

  annotations(typeOrFunc: any): any[] {
    return this._reflectionCapabilities.annotations(typeOrFunc);
  }

  componentModuleUrl(type: any, cmpMetadata: Component): string { /* tslint:disable-line prefer-function-over-method */
    return `./${stringify(type)}`;
  }

  // This does not exist in Angular 5.1.x but is required to exist in 5.2+
  guards(type: any): {[key: string]: any} { /* tslint:disable-line prefer-function-over-method */
    return {};
  }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this._reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }

  parameters(typeOrFunc: any): any[][] {
    return this._reflectionCapabilities.parameters(typeOrFunc);
  }

  propMetadata(typeOrFunc: any): {[key: string]: any[]} {
    return this._reflectionCapabilities.propMetadata(typeOrFunc);
  }

  resolveExternalReference(ref: ExternalReference): any { /* tslint:disable-line prefer-function-over-method */
    return ref.runtime;
  }
}
