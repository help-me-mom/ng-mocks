import {
  Component,
  HostBinding,
  output,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'child-output-15007',
  standalone: false,
  template: '',
})
class ChildComponent {
  @HostBinding('attr.data-event')
  public readonly event = output<string>({ alias: 'changed' });
}

@Component({
  standalone: false,
  template:
    '<child-output-15007 (changed)="events.push($event)"></child-output-15007>',
})
class HostComponent {
  public events: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15007
describe('issue-15007:output', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise output from Angular 17.3.
  if (
    !reflectComponentType(ChildComponent)?.outputs.some(
      metadata => metadata.propName === 'event',
    )
  ) {
    it('needs compiled output metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  for (const mock of [false, true]) {
    it(`preserves aliased output bindings on a host-bound member with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          HostComponent,
          mock ? MockComponent(ChildComponent) : ChildComponent,
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const element = ngMocks.find(fixture, ChildComponent);
      const child = ngMocks.get(element, ChildComponent);

      child.event.emit('first');
      child.event.emit('second');
      expect(fixture.componentInstance.events).toEqual([
        'first',
        'second',
      ]);
      expect(element.nativeElement.dataset.event !== undefined).toBe(
        !mock,
      );
    });
  }
});
