import {
  AfterViewInit,
  Component,
  Injectable,
  ViewChild,
} from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

@Injectable()
export class TargetChildService {
  public print(): string {
    return this.constructor.name;
  }
}

@Injectable()
export class TargetService {
  public constructor(public child: TargetChildService) {}

  public print(): string {
    return this.constructor.name;
  }
}

@Component({
  providers: [TargetService, TargetChildService],
  selector: 'target-170',
  template: 'target {{ service.print() }}',
})
export class TargetComponent {
  public constructor(public service: TargetService) {}

  public someMethod() {
    return this.constructor.name;
  }
}

@Component({
  selector: 'real',
  template: '<target-170></target-170>',
})
export class RealComponent implements AfterViewInit {
  @ViewChild(TargetComponent, {} as any)
  protected child?: TargetComponent;

  public ngAfterViewInit() {
    if (this.child) {
      this.child.service.print();
      this.child.service.child.print();
    }
  }
}

// a normal case is a creation without an error.
// @see https://github.com/help-me-mom/ng-mocks/issues/170
describe('issue-170:real', () => {
  beforeEach(() => MockBuilder(RealComponent).keep(TargetComponent));

  it('should render', () => {
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});

// when we mock a ViewChild component then we should have an option to customize its initialization with MockInstance.
// @see https://github.com/help-me-mom/ng-mocks/issues/170
describe('issue-170:mock', () => {
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        if (injector) {
          instance.service = injector.get(TargetService);
        }
      },
    });
    MockInstance(TargetService, {
      init: (instance, injector) => {
        if (injector) {
          instance.child = injector.get(TargetChildService);
        }
      },
    });
  });
  afterEach(MockReset);

  it('should render', () => {
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});

// if we call MockInstance without a callback then it should reset its state.
// @see https://github.com/help-me-mom/ng-mocks/issues/170
describe('issue-170:mock:reset', () => {
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        if (injector) {
          instance.service = injector.get(TargetService);
        }
      },
    });
    MockInstance(TargetService, {
      init: (instance, injector) => {
        if (injector) {
          instance.child = injector.get(TargetChildService);
        }
      },
    });
    MockInstance(TargetComponent);
    MockInstance(TargetService);
  });
  afterEach(MockReset);

  it('should render', () => {
    expect(() => MockRender(RealComponent)).toThrow();
  });
});
