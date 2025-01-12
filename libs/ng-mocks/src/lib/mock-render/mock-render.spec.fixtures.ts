import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

@Component({
  selector: 'render-real-component',
  standalone: false,
  template: '<span (click)="trigger.emit($event)">{{ content }}</span>',
})
export class RenderRealComponent {
  @Output() public trigger = new EventEmitter();
  @Input() public content = '';

  public realName = '';

  public constructor(@Inject(DOCUMENT) public readonly document: Document) {
    this.document.querySelector('#test');
  }

  public get nameProp(): string {
    return this.realName;
  }

  public set nameProp(value: string) {
    this.realName = value;
  }

  public name(): string {
    return this.realName;
  }
}

@Component({
  standalone: false,
  template: 'WithoutSelectorComponent',
})
export class WithoutSelectorComponent {}

@Component({
  selector: 'empty',
  standalone: false,
  template: 'empty',
})
export class EmptyComponent {}
