// tslint:disable:max-classes-per-file

import { Directive } from '@angular/core';

@Directive({
  selector: 'MyDirective',
})
export class MyDirective {}

@Directive({
  selector: 'WeDontWantToMock',
})
export class DirectiveWeDontWantToMock {}

@Directive({
  selector: '[WeWantToMock]',
})
export class DirectiveWeWantToMock {}
