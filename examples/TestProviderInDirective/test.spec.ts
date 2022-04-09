import {
  Directive,
  ElementRef,
  Injectable,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = true;
}

// The purpose of the directive is to add a background color
// on mouseenter and to remove it on mouseleave.
@Directive({
  providers: [TargetService],
  selector: '[target]',
})
class TargetDirective implements OnInit {
  public constructor(
    public readonly service: TargetService,
    protected ref: ElementRef,
    protected templateRef: TemplateRef<void>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  public ngOnInit(): void {
    this.viewContainerRef.clear();
    if (this.service.value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}

describe('TestProviderInDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder.
  // Because we do not care about TargetDirective, we pass it as
  // the second parameter for being replaced with a mock copy.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetDirective));

  it('has access to the service via a directive', () => {
    // Let's render a div with the directive. It provides a point
    // to access the service.
    const fixture = MockRender('<div target></div>');

    // The root element is fixture.point and it has access to the
    // context of the directive. Its injector can extract the service.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });

  it('has access to the service via a structural directive', () => {
    // Let's render a div with the directive. It provides a point to
    // access the service.
    const fixture = MockRender('<div *target></div>');

    // The root element is fixture.point and it has access to the
    // context of the directive. Its injector can extract the service.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });
});
