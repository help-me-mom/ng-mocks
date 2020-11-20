import { Component, Input } from '@angular/core';

@Component({
  selector: 'getter-setter',
  template: '',
})
export class GetterSetterComponent {
  @Input()
  public normalInput?: boolean;

  public normalProperty = false;
  public get myGetter() {
    return true;
  }

  public set mySetter(value: string) {}

  public normalMethod(): boolean {
    return this.myGetter;
  }
}
