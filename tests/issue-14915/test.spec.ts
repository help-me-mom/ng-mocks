import {
  ChangeDetectionStrategy,
  Component,
  Input,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

@Component({
  host: { 'data-strategy': 'implicit' },
  standalone: true,
  template: '{{ items.length }}',
})
class SelectorlessComponent {
  @Input() public items: string[] = [];
}

@Component({
  selector: 'target-14915[items]',
  standalone: true,
  template: '{{ items.length }}',
})
class ComplexSelectorComponent {
  @Input() public items: string[] = [];
}

@Component({
  selector: 'first-14915, second-14915',
  standalone: true,
  template: '{{ items.length }}',
})
class MultipleSelectorsComponent {
  @Input() public items: string[] = [];
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  host: { 'data-strategy': 'default' },
  standalone: true,
  template: '{{ items.length }}',
})
class ExplicitDefaultComponent {
  @Input() public items: string[] = [];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-strategy': 'on-push' },
  standalone: true,
  template: '{{ items.length }}',
})
class ExplicitOnPushComponent {
  @Input() public items: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14915
describe('issue-14915', () => {
  beforeEach(() =>
    MockBuilder([
      SelectorlessComponent,
      ComplexSelectorComponent,
      MultipleSelectorsComponent,
      ExplicitDefaultComponent,
      ExplicitOnPushComponent,
    ]),
  );

  // Angular 22's reflected annotations report Default for implicit OnPush.
  // A middleware clone must preserve the compiled component's strategy.
  it('preserves implicit OnPush for a selectorless component', () => {
    const originalDefinition = (SelectorlessComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(SelectorlessComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(SelectorlessComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(SelectorlessComponent);
    expect(instance instanceof SelectorlessComponent).toBe(true);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(true);
    expect((SelectorlessComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(true);
    expect(reflectComponentType(SelectorlessComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves implicit OnPush for a complex selector', () => {
    const originalDefinition = (ComplexSelectorComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(ComplexSelectorComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(ComplexSelectorComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(ComplexSelectorComponent);
    expect(instance instanceof ComplexSelectorComponent).toBe(true);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(true);
    expect((ComplexSelectorComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(true);
    expect(reflectComponentType(ComplexSelectorComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves implicit OnPush for multiple selectors', () => {
    const originalDefinition = (MultipleSelectorsComponent as any)
      .ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(MultipleSelectorsComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(
      MultipleSelectorsComponent,
      parameters,
    );
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(MultipleSelectorsComponent);
    expect(instance instanceof MultipleSelectorsComponent).toBe(true);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(true);
    expect((MultipleSelectorsComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(true);
    expect(reflectComponentType(MultipleSelectorsComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves explicit Default checking for an unchanged input reference', () => {
    const originalDefinition = (ExplicitDefaultComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(ExplicitDefaultComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(ExplicitDefaultComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(ExplicitDefaultComponent);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(false);
    expect((ExplicitDefaultComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(false);
    expect(reflectComponentType(ExplicitDefaultComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves explicit OnPush checking for an unchanged input reference', () => {
    const originalDefinition = (ExplicitOnPushComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(ExplicitOnPushComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(ExplicitOnPushComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(ExplicitOnPushComponent);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(true);
    expect((ExplicitOnPushComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(true);
    expect(reflectComponentType(ExplicitOnPushComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves an effective TestBed override from implicit OnPush to Default', async () => {
    TestBed.overrideComponent(SelectorlessComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
    await TestBed.compileComponents();
    const originalDefinition = (SelectorlessComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(SelectorlessComponent)!,
    };
    const parameters = { items: [] as string[] };
    const fixture = MockRender(SelectorlessComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(SelectorlessComponent);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(false);
    expect((SelectorlessComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(false);
    expect(reflectComponentType(SelectorlessComponent)).toEqual(
      originalMetadata,
    );
  });

  it('preserves an OnPush override applied after creating the middleware clone', async () => {
    const factory = MockRenderFactory(ExplicitDefaultComponent, [
      'items',
    ]);
    expect((ExplicitDefaultComponent as any).ɵcmp.onPush).toBe(false);

    TestBed.overrideComponent(ExplicitDefaultComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    await TestBed.compileComponents();
    const originalDefinition = (ExplicitDefaultComponent as any).ɵcmp;
    const originalMetadata = {
      ...reflectComponentType(ExplicitDefaultComponent)!,
    };
    expect(originalDefinition.onPush).toBe(true);

    const parameters = { items: [] as string[] };
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(ExplicitDefaultComponent);
    expect(instance instanceof ExplicitDefaultComponent).toBe(true);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp.onPush).toBe(true);
    expect((ExplicitDefaultComponent as any).ɵcmp).toBe(
      originalDefinition,
    );
    expect(originalDefinition.onPush).toBe(true);
    expect(reflectComponentType(ExplicitDefaultComponent)).toEqual(
      originalMetadata,
    );
  });
});
