import {
  Component,
  ContentChild,
  EventEmitter,
  Injectable,
  OnDestroy,
  Output,
  TemplateRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public value = 'real';
}

@Component({
  selector: 'lazy-provider',
  ['standalone' as never]: false,
  template: '<button (click)="value = \'clicked\'">click</button>',
  providers: [MockProvider(TargetService, { value: 'default' })],
})
class LazyComponent implements OnDestroy {
  public value = 'created';

  public ngOnDestroy(): void {
    this.value = 'destroyed';
  }
}

@Component({
  selector: 'query-owner',
  ['standalone' as never]: false,
  template: '<ng-content></ng-content>',
})
class QueryComponent {
  @ContentChild('tpl', {} as never)
  public tpl?: TemplateRef<void>;

  @Output() public changed = new EventEmitter<string>();
  public value = 'real';
}

describe('mock-instance-member:lifecycle', () => {
  MockInstance.scope();

  it('preserves query initialization and output cleanup', async () => {
    await MockBuilder().mock(QueryComponent);
    const changed =
      typeof jest === 'undefined'
        ? jasmine.createSpy('changed')
        : jest.fn();
    // Tracking starts in the mock constructor, before Angular registers these queries and listeners.
    const fixture = MockRender(
      '<query-owner (changed)="changed($event)"><ng-template #tpl>content</ng-template></query-owner>',
      { changed },
    );
    const component = ngMocks.findInstance(QueryComponent);
    expect(component.tpl!.elementRef.nativeElement).toBe(
      ngMocks.findTemplateRef('tpl').elementRef.nativeElement,
    );

    MockInstance(QueryComponent, 'value', 'updated');
    component.changed.emit('before');
    expect(changed).toHaveBeenCalledWith('before');

    fixture.destroy();
    component.changed.emit('after');
    MockInstance(QueryComponent, 'value', 'destroyed');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(component.value).toEqual('updated');
  });

  it('cleans up lazy providers without affecting sibling views or Angular hooks', async () => {
    await TestBed.configureTestingModule({
      declarations: [LazyComponent],
    }).compileComponents();
    const first = TestBed.createComponent(LazyComponent);
    const unused = TestBed.createComponent(LazyComponent);
    const second = TestBed.createComponent(LazyComponent);
    // The template already exists when these providers are first requested.
    const destroyed = first.debugElement.injector.get(TargetService);
    const live = second.debugElement.injector.get(TargetService);
    first.destroy();
    unused.destroy();

    MockInstance(TargetService, 'value', 'updated');
    expect(destroyed.value).toEqual('default');
    expect(live.value).toEqual('updated');
    expect(first.componentInstance.value).toEqual('destroyed');
    expect(unused.componentInstance.value).toEqual('destroyed');
    expect(second.componentInstance.value).toEqual('created');

    second.destroy();
    MockInstance(TargetService, 'value', 'after');
    expect(live.value).toEqual('updated');
    expect(second.componentInstance.value).toEqual('destroyed');
  });
});
