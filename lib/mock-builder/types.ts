// tslint:disable:interface-name

import { InjectionToken, NgModule, PipeTransform, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AnyType, Type } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';

export interface IMockBuilderResult {
  testBed: typeof TestBed;
}
export interface IMockBuilderConfigAll {
  dependency?: boolean; // won't be added to TestBedModule.
  export?: boolean; // will be forced for export in its module.
}

export interface IMockBuilderConfigModule {
  exportAll?: boolean; // exports all declarations and imports.
}

export interface IMockBuilderConfigComponent {
  render?: {
    [blockName: string]:
      | boolean
      | {
          $implicit?: any;
          variables?: { [key: string]: any };
        };
  };
}

export interface IMockBuilderConfigDirective {
  render?:
    | boolean
    | {
        $implicit?: any;
        variables?: { [key: string]: any };
      };
}

export type IMockBuilderConfig =
  | IMockBuilderConfigAll
  | IMockBuilderConfigModule
  | IMockBuilderConfigComponent
  | IMockBuilderConfigDirective;

export interface IMockBuilder {
  beforeCompileComponents(callback: (testBed: typeof TestBed) => void): this;

  build(): NgModule;

  exclude(def: any): this;

  keep<T>(def: NgModuleWithProviders<T>, config?: IMockBuilderConfig): this;

  keep<T>(token: InjectionToken<T>, config?: IMockBuilderConfig): this;

  keep<T>(def: AnyType<T>, config?: IMockBuilderConfig): this;

  keep(def: any, config?: IMockBuilderConfig): this;

  keep(input: any, config?: IMockBuilderConfig): this;

  mock<T extends PipeTransform>(pipe: AnyType<T>, config?: IMockBuilderConfig): this;

  mock<T extends PipeTransform>(pipe: AnyType<T>, mock?: PipeTransform['transform'], config?: IMockBuilderConfig): this;

  mock<T>(token: InjectionToken<T>, mock: any, config: IMockBuilderConfig): this;

  mock<T>(provider: AnyType<T>, mock: AnyType<T>, config: IMockBuilderConfig): this;

  mock<T>(provider: AnyType<T>, mock: Partial<T>, config: IMockBuilderConfig): this;

  mock<T>(provider: AnyType<T>, mock: AnyType<T>, config: IMockBuilderConfig): this;

  mock<T>(token: InjectionToken<T>, mock?: any): this;

  mock<T>(def: NgModuleWithProviders<T>): this;

  mock<T>(def: AnyType<T>, config: IMockBuilderConfig): this;

  mock<T>(provider: AnyType<T>, mock?: Partial<T>): this;

  mock<T>(def: AnyType<T>): this;

  mock(input: any, a1: any, a2?: any): this;

  provide(def: Provider): this;

  replace(source: Type<any>, destination: Type<any>, config?: IMockBuilderConfig): this;

  then<TResult1 = IMockBuilderResult, TResult2 = never>(
    fulfill?: (value: IMockBuilderResult) => PromiseLike<TResult1>,
    reject?: (reason: any) => PromiseLike<TResult2>
  ): PromiseLike<TResult1 | TResult2>;
}
