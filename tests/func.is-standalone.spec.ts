import { Component, VERSION } from '@angular/core';

import { isStandalone } from 'ng-mocks';

@Component({
  selector: 'standalone',
  template: `<div>
    <h1>Angular 19 standalone</h1>
  </div>`,
})
class StandaloneComponent {}

describe('func.is-standalone', () => {
  describe('Angular 19+ specific tests', () => {
    let originalMajor: string = VERSION.major;
    const setVersionMajor = (major: number) => {
      originalMajor = VERSION.major;
      Object.assign(VERSION, { ...VERSION, major: major.toString() });
    };

    afterEach(() => {
      Object.assign(VERSION, { ...VERSION, major: originalMajor });
    });

    it('should return true when standalone is undefined', () => {
      setVersionMajor(19);
      expect(isStandalone(StandaloneComponent)).toBeTruthy();
    });
  });
});
