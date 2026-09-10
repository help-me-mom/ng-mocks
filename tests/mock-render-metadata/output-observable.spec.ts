import { Component, reflectComponentType } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-metadata-observable[events]',
  standalone: true,
  template: '',
})
class TargetComponent {
  public readonly events = new Subject<string>();
  public readonly changed = outputFromObservable(this.events);
  public readonly selected = outputFromObservable(this.events, {
    alias: 'chosen',
  });
}

describe('mock-render-metadata:output-observable', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise these outputs from Angular 17.3.
  if (
    !reflectComponentType(TargetComponent)?.outputs.some(
      metadata => metadata.propName === 'selected',
    )
  ) {
    it('needs compiled observable output metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('binds observable outputs and aliases once and unsubscribes when the clone is destroyed', () => {
    const changed: string[] = [];
    const chosen: string[] = [];
    const fixture = MockRender(TargetComponent, {
      changed: (value: string) => changed.push(value),
      chosen: (value: string) => chosen.push(value),
    });
    const events = fixture.point.componentInstance.events;

    expect(events.observed).toBe(true);
    expect(changed).toEqual([]);
    expect(chosen).toEqual([]);

    events.next('first');
    fixture.detectChanges();
    events.next('second');

    expect(changed).toEqual(['first', 'second']);
    expect(chosen).toEqual(['first', 'second']);

    fixture.destroy();

    expect(events.observed).toBe(false);
    events.next('after-destroy');
    expect(changed).toEqual(['first', 'second']);
    expect(chosen).toEqual(['first', 'second']);
  });
});
