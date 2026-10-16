/* eslint-disable no-console */

import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({ selector: '[target]', standalone: false })
class TargetDirective {}

// Nested selector contexts expose repeated subtree traversal.
let template = '';
for (let index = 0; index < 100; index += 1) {
  template = `<div target>${template}</div>`;
}

@Component({
  selector: 'target-lookup-performance',
  standalone: false,
  template,
})
class TargetComponent {}

describe('performance:lookup', () => {
  ngMocks.faster();
  let fixture: MockedComponentFixture<TargetComponent>;

  beforeAll(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent, TargetDirective],
    }).compileComponents(),
  );
  beforeAll(() => {
    fixture = MockRender(TargetComponent);
  });

  it('measures repeated first-result lookups in a large view', () => {
    const start = performance.now();
    for (let index = 0; index < 10_000; index += 1) {
      const instance = ngMocks.get(fixture.point, TargetComponent);
      if (instance !== fixture.point.componentInstance) {
        throw new Error('First-result lookup changed the instance');
      }
    }
    console.log(`lookup:get:10000 ${performance.now() - start}ms`);
  });

  it('measures overlapping plural lookup contexts', () => {
    const start = performance.now();
    for (let index = 0; index < 500; index += 1) {
      const instances = ngMocks.findInstances(
        '[target]',
        TargetDirective,
      );
      if (instances.length !== 100) {
        throw new Error('Plural lookup changed the result count');
      }
    }
    console.log(
      `lookup:findInstances:500 ${performance.now() - start}ms`,
    );
  });
});
