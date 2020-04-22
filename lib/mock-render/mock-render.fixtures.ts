import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

@Component({
  selector: 'render-real-component',
  template: '<span (click)="click.emit($event)">{{ content }}</span>',
})
export class RenderRealComponent {
  @Output() click = new EventEmitter<{}>();
  @Input() content = '';

  public readonly document: Document;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.document = document;
    this.document.getElementById('test');
  }
}
