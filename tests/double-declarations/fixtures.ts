import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList,
} from '@angular/core';

@Directive({
  selector: 'base1',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Base1Directive {}

@Directive({
  selector: 'base2',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Base2Directive {}

@Directive({
  selector: 'base3',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Base3Directive {}

@Directive({
  selector: 'override1',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Override1Directive {}

@Directive({
  selector: 'override2',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Override2Directive {}

@Directive({
  selector: 'override3',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class Override3Directive {}

@Directive({
  selector: 'div',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class DivDirective {
  @Input() public prop: number | null = null;
}

@Directive({
  selector: 'base1',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
@Directive({
  selector: 'base2',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class BaseDirective {
  @ContentChild(DivDirective, {} as never) public contentChildBase?: DivDirective;
  @ContentChildren(DivDirective, {} as never) public contentChildrenBase?: QueryList<DivDirective>;

  @HostBinding('attr.base1') public hostBase1: any;
  @HostBinding('attr.base2') public hostBase2: any;
  public hostBase3 = '';

  @Output() @Input() public mix1: EventEmitter<void> | string = new EventEmitter();

  @Input() @Output() public mix2: EventEmitter<void> | string = new EventEmitter();
  @Input() public prop1: EventEmitter<void> | string = '';

  @Input('prop2alias') public prop2: EventEmitter<void> | string = '';
  @Input('prop3alias') public prop3: EventEmitter<void> | string = '';

  @Input() public propBase1: EventEmitter<void> | string = '';
  @Output() public propBase2 = new EventEmitter<void>();

  @HostListener('focus') public hostBaseHandler3() {
    this.hostBase3 = 'base3';
  }
}

@Component({
  selector: 'override1',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'override1<ng-content></ng-content>',
})
@Component({
  selector: 'override2',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'override2<ng-content></ng-content>',
})
export class OverrideComponent extends BaseDirective {
  @ContentChild(DivDirective, {} as never) public contentChildOverride?: DivDirective;
  @ContentChildren(DivDirective, {} as never) public contentChildrenOverride?: QueryList<DivDirective>;

  @HostBinding('attr.override2') public hostBase2: any;
  @HostBinding('attr.override1') public hostOverride1: any;
  public hostOverride3 = '';

  @Output() public prop1: EventEmitter<void> | string = new EventEmitter();
  @Input('override2alias') public prop2: EventEmitter<void> | string = '';

  @Input('override3alias') public prop3: EventEmitter<void> | string = '';
  @Input() public propOverride1: EventEmitter<void> | string = '';

  @Output() public propOverride2 = new EventEmitter<void>();

  @HostListener('click') public hostBaseHandler3() {
    this.hostOverride3 = 'override3';
  }
}
