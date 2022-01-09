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
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Directive({
  selector: 'div',
})
export class DivCls {
  @Input() public prop: number | null = null;
}

@Directive({
  selector: 'base1',
})
@Directive({
  selector: 'base2',
})
export class BaseCls {
  @ContentChild(DivCls) public contentChildBase?: DivCls;
  @ContentChildren(DivCls) public contentChildrenBase?: QueryList<DivCls>;

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

  @ViewChild(DivCls) public viewChildBase?: DivCls;
  @ViewChildren(DivCls) public viewChildrenBase?: QueryList<DivCls>;

  @HostListener('focus') public hostBaseHandler3() {
    this.hostBase3 = 'base3';
  }
}

@Component({
  selector: 'override1',
  template: `override1<ng-content></ng-content>`,
})
@Component({
  selector: 'override2',
  template: `override2<ng-content></ng-content>`,
})
export class OverrideCls extends BaseCls {
  @ContentChild(DivCls) public contentChildOverride?: DivCls;
  @ContentChildren(DivCls) public contentChildrenOverride?: QueryList<DivCls>;

  @HostBinding('attr.override2') public hostBase2: any;
  @HostBinding('attr.override1') public hostOverride1: any;
  public hostOverride3 = '';

  @Output() public prop1: EventEmitter<void> | string = new EventEmitter();
  @Input('override2alias') public prop2: EventEmitter<void> | string = '';

  @Input('override3alias') public prop3: EventEmitter<void> | string = '';
  @Input() public propOverride1: EventEmitter<void> | string = '';

  @Output() public propOverride2 = new EventEmitter<void>();

  @ContentChild(DivCls) public viewChildBase?: DivCls;
  @ContentChildren(DivCls) public viewChildrenBase?: QueryList<DivCls>;

  @HostListener('click') public hostBaseHandler3() {
    this.hostOverride3 = 'override3';
  }
}
