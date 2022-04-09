import {
  Directive,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// The purpose of the directive is to add a background color
// on mouseenter and to remove it on mouseleave.
// By default the color is yellow.
@Directive({
  selector: '[target]',
})
class TargetDirective {
  @Input() public color = 'yellow';

  public constructor(protected ref: ElementRef) {}

  @HostListener('mouseenter') public onMouseEnter() {
    this.ref.nativeElement.style.backgroundColor = this.color;
  }

  @HostListener('mouseleave') public onMouseLeave() {
    this.ref.nativeElement.style.backgroundColor = '';
  }
}

describe('TestAttributeDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the directive, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetDirective));

  it('uses default background color', () => {
    const fixture = MockRender('<div target></div>');

    // By default, without the mouse enter, there is no background
    // color on the div.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"',
    );

    // Let's simulate the mouse enter event.
    // fixture.point is out root element from the rendered template,
    // therefore it points to the div we want to trigger the event
    // on.
    fixture.point.triggerEventHandler('mouseenter', null);

    // Let's assert the color.
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: yellow;"',
    );

    // Now let's simulate the mouse mouse leave event.
    fixture.point.triggerEventHandler('mouseleave', null);

    // And assert that the background color is gone now.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"',
    );
  });

  it('sets provided background color', () => {
    // When we want to test inputs / outputs we need to use the second
    // parameter of MockRender, simply pass there variables for the
    // template, they'll become properties of
    // fixture.componentInstance.
    const fixture = MockRender('<div [color]="color" target></div>', {
      color: 'red',
    });

    // Let's assert that the background color is red.
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: red;"',
    );

    // Let's switch the color, we do not need `.point`, because we
    // access a middle component of MockRender.
    fixture.componentInstance.color = 'blue';
    fixture.detectChanges(); // shaking the template
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: blue;"',
    );
  });
});
