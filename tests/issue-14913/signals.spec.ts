import {
  Component,
  input,
  NgModule,
  reflectComponentType,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

interface Item {
  name: string;
}

@Component({
  selector: 'target-14913-signals',
  standalone: false,
  template: `
    @for (item of items(); track item) {
      <span
        >{{ item.name().value() }}:{{ item.name().touched() }}</span
      >
    }
  `,
})
class TargetComponent {
  public readonly items = input.required<FieldTree<Item[]>>();
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14913
describe('issue-14913:signals', () => {
  if (
    !reflectComponentType(TargetComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'items',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('preserves a FieldTree passed through a custom MockRender template', () => {
    const params: { items: FieldTree<Item[]> | undefined } = {
      items: undefined,
    };
    const options = { detectChanges: false, valueKeys: ['items'] };
    // Configure the wrapper before creating a form in TestBed's injection context.
    const fixture = MockRender<TargetComponent, typeof params>(
      '<target-14913-signals [items]="items"></target-14913-signals>',
      params,
      options,
    );
    const formState = signal({ items: [{ name: 'initial' }] });
    const formModel = TestBed.runInInjectionContext(() =>
      form(formState),
    );
    params.items = formModel.items;
    const transported = fixture.componentInstance.items!;

    // FieldTree is callable and iterable, and resolves child fields through its proxy.
    expect(transported).toBe(formModel.items);
    expect(transported()).toBe(formModel.items());
    expect([...transported][0]).toBe(formModel.items[0]);
    expect(transported[0]).toBe(formModel.items[0]);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.items()).toBe(
      formModel.items,
    );
    expect(ngMocks.formatText(fixture)).toBe('initial:false');

    transported[0].name().value.set('edited');
    transported[0].name().markAsTouched();
    fixture.detectChanges();

    // Angular may add internal symbol keys to array items.
    expect(formState().items.length).toBe(1);
    expect(formState().items[0].name).toBe('edited');
    expect(formModel.items[0].name().touched()).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('edited:true');

    formState.set({ items: [{ name: 'updated' }] });
    fixture.detectChanges();

    expect(fixture.componentInstance.items).toBe(formModel.items);
    expect(fixture.point.componentInstance.items()).toBe(
      formModel.items,
    );
    expect(ngMocks.formatText(fixture)).toContain('updated');
  });

  it('preserves a FieldTree passed through explicit custom factory bindings', () => {
    const options = { configureTestBed: false, valueKeys: ['items'] };
    const factory = MockRenderFactory<TargetComponent>(
      '<target-14913-signals [items]="items"></target-14913-signals>',
      ['items'],
      options,
    );
    factory.configureTestBed();
    const formState = signal({ items: [{ name: 'initial' }] });
    const formModel = TestBed.runInInjectionContext(() =>
      form(formState),
    );
    const fixture = factory({ items: formModel.items }, false);
    const transported = fixture.componentInstance.items;

    expect(transported).toBe(formModel.items);
    expect(transported()).toBe(formModel.items());
    expect([...transported][0]).toBe(formModel.items[0]);
    expect(transported[0]).toBe(formModel.items[0]);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.items()).toBe(
      formModel.items,
    );
    expect(ngMocks.formatText(fixture)).toBe('initial:false');

    transported[0].name().value.set('edited');
    transported[0].name().markAsTouched();
    fixture.detectChanges();

    expect(formState().items.length).toBe(1);
    expect(formState().items[0].name).toBe('edited');
    expect(formModel.items[0].name().touched()).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('edited:true');

    formState.set({ items: [{ name: 'updated' }] });
    fixture.detectChanges();

    expect(fixture.componentInstance.items).toBe(formModel.items);
    expect(fixture.point.componentInstance.items()).toBe(
      formModel.items,
    );
    expect(ngMocks.formatText(fixture)).toContain('updated');
  });
});
