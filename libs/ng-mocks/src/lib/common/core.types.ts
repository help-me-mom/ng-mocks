// istanbul ignore file
/* eslint-disable @typescript-eslint/ban-types */

import { DebugNode, InjectionToken } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

/**
 * A5 requires it to be a type, because interface doesn't work with A5.
 * It matches abstract classes.
 *
 * @internal
 */
type AbstractType<T> = Function & {
  prototype: T;
};

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
 * It matches any declaration in angular.
 *
 * @internal
 */
export type AnyDeclaration<T> = AnyType<T> | InjectionToken<T> | string;

/**
 * Normalized Input / Output type.
 * It should be A16 structure.
 *
 * @internal
 */
export type DirectiveIoParsed = { name: string; alias?: string; required?: boolean };

/**
 * Possible Input / Output type.
 *
 * @internal
 */
export type DirectiveIo = string | DirectiveIoParsed;

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

/**
 * @internal
 */
export type dependencyKeys =
  | 'declarations'
  | 'hostDirectives'
  | 'entryComponents'
  | 'bootstrap'
  | 'providers'
  | 'viewProviders'
  | 'imports'
  | 'exports'
  | 'schemas';
