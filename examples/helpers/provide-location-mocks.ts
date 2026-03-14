import { Location, LocationStrategy } from '@angular/common';
import * as ngCommonTesting from '@angular/common/testing';
import { Provider } from '@angular/core';

type CommonTestingCompat = typeof ngCommonTesting & {
  provideLocationMocks?: () => Provider[];
};

export const provideLocationMocksCompat = (): Provider[] => {
  const commonTesting = ngCommonTesting as CommonTestingCompat;

  if (commonTesting.provideLocationMocks) {
    return commonTesting.provideLocationMocks();
  }

  return [
    {
      provide: Location,
      useClass: commonTesting.SpyLocation,
    },
    {
      provide: LocationStrategy,
      useClass: commonTesting.MockLocationStrategy,
    },
  ];
};
