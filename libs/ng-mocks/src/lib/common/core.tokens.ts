import { InjectionToken } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { AnyType } from './core.types';

export const NG_MOCKS = new InjectionToken<Map<any, any>>('NG_MOCKS');
export const NG_MOCKS_TOUCHES = new InjectionToken<Set<any>>('NG_MOCKS_TOUCHES');
export const NG_MOCKS_OVERRIDES = new InjectionToken<Map<AnyType<any>, MetadataOverride<any>>>('NG_MOCKS_OVERRIDES');
export const NG_MOCKS_GUARDS = new InjectionToken<void>('NG_MOCKS_GUARDS');
export const NG_MOCKS_INTERCEPTORS = new InjectionToken<void>('NG_MOCKS_INTERCEPTORS');
export const NG_MOCKS_ROOT_PROVIDERS = new InjectionToken<void>('NG_MOCKS_ROOT_PROVIDERS');
