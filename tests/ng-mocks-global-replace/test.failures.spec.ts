import { Component, Directive, Injectable } from '@angular/core';

import { ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1-ng-mocks-global-replace-failures',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@Directive({
  selector: 'target1-ng-mocks-global-replace-failures',
})
class Fake1Directive {
  public readonly name = 'fake1';
}

@Injectable()
class Target2Service {
  public readonly name = 'target2';
}

@Injectable()
class Fake2Service {
  public readonly name = 'fake2';
}

describe('ng-mocks-global-replace:failures', () => {
  it('fails on services', () => {
    expect(() =>
      ngMocks.globalReplace(Target2Service, Fake2Service),
    ).toThrow();
  });

  it('fails on wrong types', () => {
    expect(() =>
      ngMocks.globalReplace(Target1Component, Fake1Directive),
    ).toThrow();
  });
});
