import { ɵReflectionCapabilities as ReflectionCapabilities, ɵstringify as stringify } from '@angular/core';

export class JitReflector {
  protected reflectionCapabilities: ReflectionCapabilities;

  public constructor() {
    this.reflectionCapabilities = new ReflectionCapabilities();
  }

  public annotations(typeOrFunc: any): any[] {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }

  public componentModuleUrl(type: any): string {
    return `./${stringify(type)}`;
  }

  // This does not exist in Angular 5.1.x but is required to exist in 5.2+
  public guards(): Record<keyof any, any> {
    return {};
  }

  public hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }

  public parameters(typeOrFunc: any): any[][] {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }

  public propMetadata(typeOrFunc: any): { [key: string]: any[] } {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }

  public shallowAnnotations(): any[] {
    throw new Error('Not supported in JIT mode');
  }

  public tryAnnotations(typeOrFunc: any): any[] {
    return this.annotations(typeOrFunc);
  }
}
