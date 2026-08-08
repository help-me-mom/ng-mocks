import { CommonModule } from '@angular/common'; // eslint-disable-line import-x/order
import { ApplicationModule } from '@angular/core'; // eslint-disable-line import-x/order
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import-x/order
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import-x/order
import { MockService, ngMocks } from 'ng-mocks'; // eslint-disable-line import-x/order

ngMocks.autoSpy('vitest');
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);
