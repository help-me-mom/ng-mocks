import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class ServiceParent {
  protected value = 'parent';

  public echo() {
    return this.value;
  }
}

@Injectable()
class ServiceReplacedParent extends ServiceParent {
  protected value = 'replaced';
}

@Injectable()
class ServiceChild {
  public constructor(public readonly parent: ServiceParent) {}
}

@Component({
  selector: 'internal-provider-with-dependency',
  template: '{{ child.parent.echo() }}',
})
class InternalComponent {
  public constructor(public readonly child: ServiceChild) {}
}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
  providers: [
    ServiceParent,
    ServiceReplacedParent,
    {
      deps: [ServiceReplacedParent],
      provide: ServiceChild,
      useFactory: (parent: ServiceParent) => new ServiceChild(parent),
    },
  ],
})
class TargetModule {}

@Injectable()
class ServiceMock {
  protected value = 'mock';

  public echo() {
    return this.value;
  }
}

describe('provider-with-dependency:real', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TargetModule],
    });

    return TestBed.compileComponents();
  });

  it('should render "parent"', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-provider-with-dependency>replaced</internal-provider-with-dependency>',
    );
  });
});

describe('provider-with-dependency:provided', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TargetModule],
      providers: [
        {
          provide: ServiceReplacedParent,
          useClass: ServiceMock,
        },
      ],
    });

    return TestBed.compileComponents();
  });

  it('should render "parent"', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-provider-with-dependency>mock</internal-provider-with-dependency>',
    );
  });
});

describe('provider-with-dependency:mock', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder()
      .keep(TargetModule)
      .provide({
        provide: ServiceReplacedParent,
        useClass: ServiceMock,
      })
      .build();
    TestBed.configureTestingModule(ngModule);

    return TestBed.compileComponents();
  });

  it('should render "parent" even the providers where patched', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-provider-with-dependency>mock</internal-provider-with-dependency>',
    );
  });
});
