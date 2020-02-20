import { Component, Input } from '@angular/core';

@Component({
  selector: 'getter-setter',
  template: ''
})
export class GetterSetterComponent {
  get myGetter() {
    return true;
  }

  set mySetter(value: string) {
  }

  @Input()
  public normalInput?: boolean;

  public normalProperty = false;

  normalMethod(): boolean {
    return this.myGetter;
  }
}
