import { Component, Input } from '@angular/core';

@Component({
  selector: 'getter-setter',
  template: '',
})
export class GetterSetterComponent {
  @Input()
  public normalInput?: boolean;

  public normalProperty = false;

  protected value: any;

  public get myGetter() {
    return true;
  }

  public set mySetter(value: string) {
    this.value = value;
  }

  public normalMethod(): boolean {
    return this.myGetter;
  }
}
