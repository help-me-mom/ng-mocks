import { InjectionToken } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { AbstractType, Type } from './core.types';

export const NG_MOCKS = new InjectionToken<Map<any, any>>('NG_MOCKS');
export const NG_MOCKS_TOUCHES = new InjectionToken<Set<any>>('NG_MOCKS_TOUCHES');
export const NG_MOCKS_OVERRIDES = new InjectionToken<Map<Type<any> | AbstractType<any>, MetadataOverride<any>>>(
  'NG_MOCKS_OVERRIDES'
);
export const NG_MOCKS_GUARDS = new InjectionToken<void>('NG_MOCKS_GUARDS');
export const NG_MOCKS_INTERCEPTORS = new InjectionToken<void>('NG_MOCKS_INTERCEPTORS');

/**
 * Use NG_MOCKS_GUARDS instead.
 * Will be removed in v11.
 * @deprecated
 */
export const NG_GUARDS = NG_MOCKS_GUARDS;

/**
 * Use NG_MOCKS_INTERCEPTORS instead.
 * Will be removed in v11.
 * @deprecated
 */
export const NG_INTERCEPTORS = NG_MOCKS_INTERCEPTORS;
