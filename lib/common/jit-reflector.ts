import { CompileReflector, ExternalReference } from '@angular/compiler';
import { ɵReflectionCapabilities as ReflectionCapabilities, ɵstringify as stringify } from '@angular/core';

export class JitReflector implements CompileReflector {
  private readonly _reflectionCapabilities: ReflectionCapabilities;

  constructor() {
    this._reflectionCapabilities = new ReflectionCapabilities();
  }

  annotations(typeOrFunc: any): any[] {
    return this._reflectionCapabilities.annotations(typeOrFunc);
  }

  componentModuleUrl = (type: any) => `./${stringify(type)}`;

  // This does not exist in Angular 5.1.x but is required to exist in 5.2+
  guards = (): { [key: string]: any } => ({});

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this._reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }

  parameters(typeOrFunc: any): any[][] {
    return this._reflectionCapabilities.parameters(typeOrFunc);
  }

  propMetadata(typeOrFunc: any): { [key: string]: any[] } {
    return this._reflectionCapabilities.propMetadata(typeOrFunc);
  }

  resolveExternalReference = (ref: ExternalReference): any => ref.runtime;

  shallowAnnotations = (): any[] => {
    throw new Error('Not supported in JIT mode');
  };

  tryAnnotations(typeOrFunc: any): any[] {
    return this.annotations(typeOrFunc);
  }
}
