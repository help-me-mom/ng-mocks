import {
  Component,
  ElementRef,
  isSignal,
  model,
  output,
  reflectComponentType,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-metadata-model[requiredLabel]',
  standalone: true,
  template: '{{ label() }}:{{ count() }}',
})
class TargetComponent {
  public readonly label = model.required<string>({
    alias: 'requiredLabel',
  });
  public readonly count = model(3, { alias: 'quantity' });
  public readonly changed = output<string>();
  public readonly selected = output<string>({ alias: 'chosen' });
}

@Component({
  standalone: true,
  template: '{{ value() }}',
})
class SelectorlessComponent {
  public readonly value = model('default-value');
}

@Component({
  selector: 'target-metadata-first, target-metadata-second',
  standalone: true,
  template: '{{ value() }}',
})
class MultipleSelectorsComponent {
  public readonly value = model.required<string>();
  public readonly changed = output<string>({ alias: 'updated' });
}

@Component({
  selector: 'target-metadata-collision',
  standalone: true,
  template: '{{ valueChange() }}',
})
class CollisionComponent {
  public readonly valueChange = model(0, { alias: 'value' });
}

@Component({
  selector: 'target-metadata-model-query',
  standalone: true,
  template: '<span #child>query</span>',
})
class QueryModelComponent {
  public readonly count = model(0, { alias: 'quantity' });
  @ViewChild('child') public quantityChange?: ElementRef;
}

@Component({
  selector: 'target-metadata-model-method',
  standalone: true,
  template: '',
})
class MethodModelComponent {
  public readonly count = model(0, { alias: 'quantity' });

  public quantityChange(): string {
    return 'real';
  }
}

describe('mock-render-metadata:output-model', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise model and output from Angular 17.3.
  if (
    !reflectComponentType(TargetComponent)?.outputs.some(
      metadata => metadata.propName === 'selected',
    )
  ) {
    it('needs compiled model and output metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder([
      TargetComponent,
      SelectorlessComponent,
      MultipleSelectorsComponent,
    ]),
  );

  it('binds aliased models and subscribes once to each output through a complex selector', () => {
    const changed: string[] = [];
    const chosen: string[] = [];
    const labels: string[] = [];
    const quantities: number[] = [];
    const fixture = MockRender(TargetComponent, {
      changed: (value: string) => changed.push(value),
      chosen: (value: string) => chosen.push(value),
      quantity: 4,
      quantityChange: (value: number) => quantities.push(value),
      requiredLabel: 'initial',
      requiredLabelChange: (value: string) => labels.push(value),
    });
    const target = fixture.point.componentInstance;
    const label = target.label;
    const count = target.count;

    expect(isSignal(label)).toBe(true);
    expect(isSignal(count)).toBe(true);
    expect(label()).toEqual('initial');
    expect(count()).toEqual(4);
    expect(fixture.nativeElement.textContent).toContain('initial:4');
    expect(labels).toEqual([]);
    expect(quantities).toEqual([]);

    target.changed.emit('changed');
    target.selected.emit('chosen');
    label.set('child');
    count.update(value => value + 1);

    expect(changed).toEqual(['changed']);
    expect(chosen).toEqual(['chosen']);
    expect(labels).toEqual(['child']);
    expect(quantities).toEqual([5]);

    // A repeated model value must not emit, and parent writes are inputs only.
    label.set('child');
    count.set(5);
    fixture.componentRef.setInput('requiredLabel', 'parent');
    fixture.componentRef.setInput('quantity', 8);
    fixture.detectChanges();

    expect(target.label).toBe(label);
    expect(target.count).toBe(count);
    expect(label()).toEqual('parent');
    expect(count()).toEqual(8);
    expect(fixture.nativeElement.textContent).toContain('parent:8');
    expect(labels).toEqual(['child']);
    expect(quantities).toEqual([5]);

    target.changed.emit('again');
    target.selected.emit('again');
    expect(changed).toEqual(['changed', 'again']);
    expect(chosen).toEqual(['chosen', 'again']);
  });

  it('retains an unbound selectorless model default with empty params', () => {
    const fixture = MockRender(SelectorlessComponent, {});
    const value = fixture.point.componentInstance.value;

    expect(isSignal(value)).toBe(true);
    expect(value()).toEqual('default-value');
    expect(fixture.nativeElement.textContent).toContain(
      'default-value',
    );

    value.update(current => `${current}-updated`);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('default-value-updated');
    expect(fixture.nativeElement.textContent).toContain(
      'default-value-updated',
    );
  });

  it('retains a selectorless model default without params and accepts later wrapper writes', () => {
    const fixture = MockRender(SelectorlessComponent);
    const value = fixture.point.componentInstance.value;

    expect(isSignal(value)).toBe(true);
    expect(value()).toEqual('default-value');
    expect(fixture.nativeElement.textContent).toContain(
      'default-value',
    );

    fixture.componentInstance.value = 'parent';
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('parent');
    expect(fixture.nativeElement.textContent).toContain('parent');
  });

  it('retains model input and implicit output metadata through multiple selectors', () => {
    const values: string[] = [];
    const updated: string[] = [];
    const fixture = MockRender(MultipleSelectorsComponent, {
      updated: (value: string) => updated.push(value),
      value: 'initial',
      valueChange: (value: string) => values.push(value),
    });
    const target = fixture.point.componentInstance;
    const value = target.value;

    expect(isSignal(value)).toBe(true);
    expect(value()).toEqual('initial');
    expect(values).toEqual([]);

    value.set('child');
    target.changed.emit('selected');
    fixture.detectChanges();

    expect(target.value).toBe(value);
    expect(value()).toEqual('child');
    expect(fixture.nativeElement.textContent).toContain('child');
    expect(values).toEqual(['child']);
    expect(updated).toEqual(['selected']);
  });

  it('keeps aliased model inputs callable and provides separate output emitters on a mock', async () => {
    TestBed.resetTestingModule();
    await MockBuilder().mock(TargetComponent);
    const labels: string[] = [];
    const quantities: number[] = [];
    const changed: string[] = [];
    const chosen: string[] = [];
    const fixture = MockRender(
      `<target-metadata-model
        [requiredLabel]="label"
        [quantity]="quantity"
        (requiredLabelChange)="labels.push($event)"
        (quantityChange)="quantities.push($event)"
        (changed)="changed.push($event)"
        (chosen)="chosen.push($event)"
      ></target-metadata-model>`,
      {
        label: 'initial',
        quantity: 4,
        labels,
        quantities,
        changed,
        chosen,
      },
    );
    const targetElement = ngMocks.find(TargetComponent);
    const target = targetElement.componentInstance;
    const label = target.label;
    const count = target.count;

    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(isSignal(label)).toBe(true);
    expect(isSignal(count)).toBe(true);
    expect(label()).toEqual('initial');
    expect(count()).toEqual(4);

    ngMocks
      .output(targetElement, 'requiredLabelChange')
      .emit('child');
    ngMocks.output(targetElement, 'quantityChange').emit(5);
    target.changed.emit('changed');
    target.selected.emit('chosen');

    expect(labels).toEqual(['child']);
    expect(quantities).toEqual([5]);
    expect(changed).toEqual(['changed']);
    expect(chosen).toEqual(['chosen']);

    fixture.componentInstance.label = 'parent';
    fixture.componentInstance.quantity = 8;
    fixture.detectChanges();

    expect(target.label).toBe(label);
    expect(target.count).toBe(count);
    expect(label()).toEqual('parent');
    expect(count()).toEqual(8);
    expect(labels).toEqual(['child']);
    expect(quantities).toEqual([5]);
  });

  it('renders a real model whose public output name is also its signal property name', async () => {
    TestBed.resetTestingModule();
    await MockBuilder(CollisionComponent);
    const changes: number[] = [];
    const fixture = MockRender(CollisionComponent, {
      value: 1,
      valueChange: (value: number) => changes.push(value),
    });
    const value = fixture.point.componentInstance.valueChange;

    expect(isSignal(value)).toBe(true);
    expect(value()).toBe(1);

    value.set(2);
    fixture.detectChanges();

    expect(changes).toEqual([2]);
    expect(fixture.point.componentInstance.valueChange).toBe(value);
    expect(fixture.nativeElement.textContent).toContain('2');
  });

  it('mocks a model with a colliding public output name without replacing its input signal', async () => {
    TestBed.resetTestingModule();
    await MockBuilder().mock(CollisionComponent);
    const changes: number[] = [];
    const fixture = MockRender(
      `<target-metadata-collision
        [value]="value"
        (valueChange)="value = $event; changes.push($event)"
      ></target-metadata-collision>`,
      { value: 1, changes },
    );
    const target = ngMocks.find(CollisionComponent);
    const value = target.componentInstance.valueChange;
    const emitter = ngMocks.output(target, 'valueChange');

    expect(
      isMockOf(target.componentInstance, CollisionComponent),
    ).toBe(true);
    expect(isSignal(value)).toBe(true);
    expect(value()).toBe(1);
    expect(emitter).not.toBe(value as never);

    emitter.emit(2);
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe(2);
    expect(value()).toBe(2);
    expect(changes).toEqual([2]);

    fixture.componentInstance.value = 3;
    fixture.detectChanges();

    expect(target.componentInstance.valueChange).toBe(value);
    expect(value()).toBe(3);
    expect(changes).toEqual([2]);
  });

  it('keeps a view query separate from a model output with the same public name on a mock', async () => {
    TestBed.resetTestingModule();
    const mock = MockComponent(QueryModelComponent);
    TestBed.configureTestingModule({ imports: [mock] });
    TestBed.overrideTemplate(mock, '<span #child>query</span>');
    await TestBed.compileComponents();
    const changes: number[] = [];
    const fixture = MockRender(
      `<target-metadata-model-query
        [quantity]="quantity"
        (quantityChange)="changes.push($event)"
      ></target-metadata-model-query>`,
      { quantity: 1, changes },
    );
    const target = ngMocks.find(QueryModelComponent);
    const query = target.componentInstance.quantityChange;
    const emitter = ngMocks.output(target, 'quantityChange');

    expect(query?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(emitter).not.toBe(query as never);

    emitter.emit(2);
    fixture.componentInstance.quantity = 3;
    fixture.detectChanges();

    expect(changes).toEqual([2]);
    expect(target.componentInstance.count()).toBe(3);
    expect(target.componentInstance.quantityChange).toBe(query);
  });

  it('keeps a method callable beside a model output with the same public name on a mock', async () => {
    TestBed.resetTestingModule();
    await MockBuilder().mock(MethodModelComponent);
    const changes: number[] = [];
    const fixture = MockRender(
      `<target-metadata-model-method
        [quantity]="quantity"
        (quantityChange)="changes.push($event)"
      ></target-metadata-model-method>`,
      { quantity: 1, changes },
    );
    const target = ngMocks.find(MethodModelComponent);
    const method = target.componentInstance.quantityChange;
    const emitter = ngMocks.output(target, 'quantityChange');

    expect(typeof method).toBe('function');
    expect(emitter).not.toBe(method as never);
    expect(() =>
      target.componentInstance.quantityChange(),
    ).not.toThrow();

    emitter.emit(2);
    fixture.componentInstance.quantity = 3;
    fixture.detectChanges();

    expect(changes).toEqual([2]);
    expect(target.componentInstance.count()).toBe(3);
    expect(target.componentInstance.quantityChange).toBe(method);
  });
});
