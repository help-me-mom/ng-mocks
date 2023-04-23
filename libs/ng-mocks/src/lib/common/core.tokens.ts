import { InjectionToken } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { AnyType } from './core.types';

/**
 * NG_MOCKS token is a map from a declaration to its mock copy.
 *
 * @internal
 *
 * ```ts
 * const MockClass = TestBed.inject(NG_MOCKS).get(RealClass);
 * ```
 */
export const NG_MOCKS = new InjectionToken<Map<any, any>>('NG_MOCKS');
(NG_MOCKS as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_TOUCHES token is a set of all touched declarations during mock process.
 *
 * @internal
 *
 * ```ts
 * const touched = TestBed.inject(NG_MOCKS_TOUCHES).has(RealClass);
 * ```
 */
export const NG_MOCKS_TOUCHES = new InjectionToken<Set<any>>('NG_MOCKS_TOUCHES');
(NG_MOCKS_TOUCHES as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_OVERRIDES token contains overrides for:
 * - TestBed.overrideModule
 * - TestBed.overrideComponent
 * - TestBed.overrideDirective
 * - TestBed.overrideProvider
 *
 * It is used when there is no way to provide a mock copy and an override is required.
 * For example, if we want to keep a component, but to override one of its local providers.
 *
 * @internal
 */
export const NG_MOCKS_OVERRIDES = new InjectionToken<Map<AnyType<any>, MetadataOverride<any>>>('NG_MOCKS_OVERRIDES');
(NG_MOCKS_OVERRIDES as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_GUARDS token influences on provided guards in MockBuilder.
 * More info by the links below.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#ng_mocks_guards-token
 * @see https://ng-mocks.sudo.eu/guides/routing-guard
 */
export const NG_MOCKS_GUARDS = new InjectionToken<void>('NG_MOCKS_GUARDS');
(NG_MOCKS_GUARDS as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_RESOLVERS token influences on provided resolvers in MockBuilder.
 * More info by the links below.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#ng_mocks_resolvers-token
 * @see https://ng-mocks.sudo.eu/guides/routing-resolver
 */
export const NG_MOCKS_RESOLVERS = new InjectionToken<void>('NG_MOCKS_RESOLVERS');
(NG_MOCKS_RESOLVERS as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_INTERCEPTORS token influences on provided interceptors in MockBuilder.
 * More info by the links below.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#ng_mocks_interceptors-token
 * @see https://ng-mocks.sudo.eu/guides/http-interceptor
 */
export const NG_MOCKS_INTERCEPTORS = new InjectionToken<void>('NG_MOCKS_INTERCEPTORS');
(NG_MOCKS_INTERCEPTORS as any).__ngMocksSkip = true;

/**
 * NG_MOCKS_ROOT_PROVIDERS token influences on root providers in MockBuilder,
 * which aren't provided in specified modules.
 * It helps to mock or keep them automatically.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#ng_mocks_root_providers-token
 */
export const NG_MOCKS_ROOT_PROVIDERS = new InjectionToken<void>('NG_MOCKS_ROOT_PROVIDERS');
(NG_MOCKS_ROOT_PROVIDERS as any).__ngMocksSkip = true;
