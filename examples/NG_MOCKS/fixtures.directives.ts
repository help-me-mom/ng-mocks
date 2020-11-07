import { Directive } from '@angular/core';

@Directive({
  selector: 'MyDirective',
})
export class MyDirective {}

@Directive({
  selector: 'WeDontWantToMimic',
})
export class DirectiveWeDontWantToMimic {}

@Directive({
  selector: '[WeWantToMimic]',
})
export class DirectiveWeWantToMimic {}
