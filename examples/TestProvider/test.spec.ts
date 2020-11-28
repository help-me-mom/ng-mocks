import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = true;

  public echo(): boolean {
    return this.value;
  }
}

describe('TestProvider', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService));

  it('returns value on echo', () => {
    const service = TestBed.get(TargetService);

    expect(service.echo()).toEqual(service.value);
  });
});
