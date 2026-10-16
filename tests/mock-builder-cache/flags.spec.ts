import { InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

const TARGET = new InjectionToken<string>('TARGET');

@NgModule({ providers: [{ provide: TARGET, useValue: 'root' }] })
class TargetModule {}

describe('MockBuilder:cache root placement', () => {
  afterEach(ngMocks.reset);

  it('includes a module when onRoot changes to true', () => {
    const first = MockBuilder()
      .keep(TargetModule, { dependency: true, onRoot: false })
      .build();
    const second = MockBuilder()
      .keep(TargetModule, { dependency: true, onRoot: true })
      .build();
    TestBed.configureTestingModule(second);

    expect(first.imports).not.toContain(TargetModule);
    expect(ngMocks.get(TARGET)).toBe('root');
  });

  it('removes a module when onRoot changes to false', () => {
    MockBuilder()
      .keep(TargetModule, { dependency: true, onRoot: true })
      .build();
    const second = MockBuilder()
      .keep(TargetModule, { dependency: true, onRoot: false })
      .build();
    TestBed.configureTestingModule(second);

    expect(second.imports).not.toContain(TargetModule);
    expect(() => ngMocks.get(TARGET)).toThrow();
  });
});
