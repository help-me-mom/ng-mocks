import { ComponentFixture, getTestBed } from '@angular/core/testing';

export default () => {
  const fixtures: Array<ComponentFixture<any>> = (getTestBed() as any)._activeFixtures;

  return fixtures[fixtures.length - 1];
};
