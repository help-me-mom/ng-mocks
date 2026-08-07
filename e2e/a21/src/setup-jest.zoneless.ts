import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless'; // eslint-disable-line import-x/order

setupZonelessTestEnv();

import { MockService, ngMocks } from 'ng-mocks'; // eslint-disable-line import-x/order

ngMocks.autoSpy('jest');

import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import-x/order
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

import { CommonModule } from '@angular/common'; // eslint-disable-line import-x/order
import { ApplicationModule } from '@angular/core'; // eslint-disable-line import-x/order
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import-x/order
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);
