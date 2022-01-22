// istanbul ignore file

import { DebugNode } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

// It has to be an interface.
export interface AbstractType<T> extends Function {
  prototype: T;
}

// It has to be an interface.
export interface Type<T> extends Function {
  // tslint:disable-next-line callable-types
  new (...args: any[]): T;
}

export type AnyType<T> = Type<T> | AbstractType<T>;

export type DebugNodeSelector =
  | DebugNode
  | ComponentFixture<any>
  | string
  | [string]
  | [string, string | number]
  | null
  | undefined;
