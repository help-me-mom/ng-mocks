import { TestModuleMetadata } from '@angular/core/testing';

export default (
  ngModule: TestModuleMetadata,
): TestModuleMetadata & {
  declarations: any[];
  imports: any[];
  providers: any[];
} => ({
  ...ngModule,
  declarations: [...(ngModule.declarations || /* istanbul ignore next */ [])],
  imports: [...(ngModule.imports || /* istanbul ignore next */ [])],
  providers: [...(ngModule.providers || /* istanbul ignore next */ [])],
});
