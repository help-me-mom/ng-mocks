import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider, MockReset } from 'ng-mocks';

@Injectable()
class TargetService {
  public echo(): string {
    return 'real';
  }
}

@Component({
  selector: 'live-scope',
  ['standalone' as never]: false,
  template: '',
  providers: [MockProvider(TargetService, { echo: () => 'default' })],
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('mock-instance-scope:existing', () => {
  MockInstance.scope();

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    }).compileComponents(),
  );

  it('restores future configuration without undoing existing mutations', () => {
    MockInstance(TargetService, 'echo', () => 'outer');
    const existing =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    MockInstance.remember();
    try {
      MockInstance(TargetService, 'echo', () => 'inner');
      expect(existing.echo()).toEqual('inner');
    } finally {
      MockInstance.restore();
    }

    expect(existing.echo()).toEqual('inner');
    const fresh =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    expect(fresh.echo()).toEqual('outer');

    MockInstance(TargetService, 'echo', () => 'later');
    expect(existing.echo()).toEqual('later');
    expect(fresh.echo()).toEqual('later');
  });

  it('resets class configuration while continuing to track live mocks', () => {
    const existing =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    MockInstance(TargetService, 'echo', () => 'customized');
    MockInstance(TargetService);

    expect(existing.echo()).toEqual('customized');
    const fresh =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    expect(fresh.echo()).toEqual('default');

    MockInstance(TargetService, 'echo', () => 'later');
    expect(existing.echo()).toEqual('later');
    expect(fresh.echo()).toEqual('later');
  });

  it('resets all configuration without reverting mutations or losing live mocks', () => {
    const existing =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    MockInstance(TargetService, 'echo', () => 'customized');
    MockReset();

    expect(existing.echo()).toEqual('customized');
    const fresh =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    expect(fresh.echo()).toEqual('default');

    MockInstance(TargetService, 'echo', () => 'later');
    expect(existing.echo()).toEqual('later');
    expect(fresh.echo()).toEqual('later');
  });

  it('releases old instances when TestBed resets', () => {
    const existing =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    });
    const fresh =
      TestBed.createComponent(TargetComponent).componentInstance
        .service;

    MockInstance(TargetService, 'echo', () => 'current');

    expect(existing.echo()).toEqual('default');
    expect(fresh.echo()).toEqual('current');
  });
});
