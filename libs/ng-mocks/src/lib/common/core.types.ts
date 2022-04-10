// istanbul ignore file

import { DebugNode } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

/**
 * It has to be an interface.
 * It matches abstract classes.
 *
 * @internal
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

/**
 * It has to be an interface.
 * It matches implemented classes.
 *
 * @internal
 */
export interface Type<T> extends Function {
  new (...args: any[]): T;
}

/**
 * It matches abstract or implemented classes.
 *
 * @internal
 */
export type AnyType<T> = Type<T> | AbstractType<T>;

/**
 * DebugNodeSelector describes supported types of selectors
 * to search elements and instances in fixtures.
 *
 * @internal
 */
export type DebugNodeSelector =
  | DebugNode
  | ComponentFixture<any>
  | string
  | [string]
  | [string, string | number]
  | null
  | undefined;
