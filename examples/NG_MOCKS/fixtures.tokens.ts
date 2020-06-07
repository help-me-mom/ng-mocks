import { InjectionToken } from '@angular/core';

export const INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK = new InjectionToken('INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK');

export const INJECTION_TOKEN_WE_WANT_TO_MOCK = new InjectionToken('INJECTION_TOKEN_WE_WANT_TO_MOCK');

export const INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE = new InjectionToken('INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE');
