import { InjectionToken } from '@angular/core';

import { MockRender } from 'ng-mocks';

const tokenObj = new InjectionToken<{ value: string }>('OBJ');
const tokenBoolean = new InjectionToken<boolean>('BOOLEAN');

// @ts-expect-error: does not accept params
MockRender(tokenObj, {});

const fixture1 = MockRender(tokenObj);
// @ts-expect-error: fails due to the void type.
fixture1.componentInstance.value = '';
// works with the correct type
fixture1.point.componentInstance.value = '';
// @ts-expect-error: fails due to the wrong type.
fixture1.point.componentInstance.value = 0;

// works due to the right value.
const fixture2 = MockRender(tokenBoolean);
fixture2.point.componentInstance = true;
// @ts-expect-error: fails due to the wrong type.
fixture2.point.componentInstance = '';
