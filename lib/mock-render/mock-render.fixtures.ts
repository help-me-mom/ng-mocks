import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'render-real-component',
  template: '<span (click)="click.emit($event)">{{ content }}</span>'
})
export class RenderRealComponent {
  @Output() click = new EventEmitter<{}>();
  @Input() content = '';
}
