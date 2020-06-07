// tslint:disable:object-literal-sort-keys member-ordering

// fix to support both jasmine and jest in the test
declare const jest: any;
declare const jasmine: any;

import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, EventEmitter, Input, NgModule, Output, TemplateRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// our dependency component that we want to mock but respect inputs and outputs
@Component({
  selector: 'app-header',
  template: `
    <a (click)="logo.emit()"><img src="assets/logo.png" *ngIf="showLogo" /></a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
export class AppHeaderComponent {
  @Input() public showLogo: boolean;
  @Input() public title: string;

  @Output() public logo: EventEmitter<void>;

  @ContentChild('menu', { read: false } as any) public menu: TemplateRef<ElementRef>;
}

// our main component that we want to test
@Component({
  selector: 'app-root',
  template: `
    <app-header [showLogo]="true" [title]="title" (logo)="logoClick.emit()">
      <ng-template #menu>
        <ul>
          <li><a [routerLink]="['/home']">Home</a></li>
          <li><a [routerLink]="['/about']">Home</a></li>
        </ul>
      </ng-template>
    </app-header>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  @Input() public title = 'My Application';

  @Output() public logoClick = new EventEmitter<void>();
}

// the module where our component is declared
@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forRoot([])],
  declarations: [AppComponent, AppHeaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

describe('main', () => {
  // instead of helper components and NO_ERRORS_SCHEMA we have a clear declaration
  // AppComponent will stay as it is
  // everything in AppModule will be mocked in a typesafe way
  beforeEach(() =>
    MockBuilder(AppComponent, AppModule).mock(AppHeaderComponent, {
      // adding a special config how to mock AppHeaderComponent
      render: {
        menu: true, // #menu template will be rendered together with mocked AppHeaderComponent.
      },
    })
  );

  it('example', () => {
    // renders the component as <app-root [title]="'Fake Application'" (logoClick)="logoClickSpy($event)"></app-root>
    // real component is accessible via fixture.point
    const logoClickSpy = typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    const fixture = MockRender(AppComponent, {
      title: 'Fake Application',
      logoClick: logoClickSpy,
    });

    // the same as fixture.debugElement.query(By.directive(AppHeaderComponent));
    // but typesafe and fails if nothing was found
    const header = ngMocks.find(fixture.debugElement, AppHeaderComponent);

    // asserting how AppComponent uses AppHeaderComponent
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // checking that AppComponents updates AppHeaderComponent
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe('Updated Application');

    // checking that AppComponent listens on outputs of AppHeaderComponent
    expect(logoClickSpy).not.toHaveBeenCalled();
    header.componentInstance.logo.emit();
    expect(logoClickSpy).toHaveBeenCalled();

    // asserting that AppComponent passes the right menu into AppHeaderComponent
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);
    // an easy way to get a value of an input
    // the same as links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(links[0], 'routerLink')).toEqual(['/home']);
    expect(ngMocks.input(links[1], 'routerLink')).toEqual(['/about']);
  });
});
