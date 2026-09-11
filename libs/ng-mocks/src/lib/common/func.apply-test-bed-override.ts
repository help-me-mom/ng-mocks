import { TestBed } from '@angular/core/testing';

import { isNgDef } from './func.is-ng-def';

export default (def: any, override: any): void => {
  if (isNgDef(def, 'c')) {
    TestBed.overrideComponent(def, override);
  } else if (isNgDef(def, 'd')) {
    TestBed.overrideDirective(def, override);
  } else if (isNgDef(def, 'm')) {
    TestBed.overrideModule(def, override);
  }
  if (isNgDef(def, 't')) {
    TestBed.overrideProvider(def, override);
  } else if (isNgDef(def, 'i')) {
    TestBed.overrideProvider(def, override);
  }
};
