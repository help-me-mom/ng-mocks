import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

describe('TestSignalForms:field-tree', () => {
  beforeEach(() =>
    MockBuilder().keep(FormField).keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('binds a child field from a tree passed through a custom template', () => {
    const params: {
      f: FieldTree<{ name: string }> | undefined;
    } = { f: undefined };

    // Configure the wrapper before creating the form in TestBed's injection context.
    const fixture = MockRender(
      '<input [formField]="f.name" />',
      params,
      { detectChanges: false, valueKeys: ['f'] },
    );
    const model = signal({ name: 'Ada' });
    const f = TestBed.runInInjectionContext(() => form(model));

    params.f = f;
    fixture.detectChanges();

    // Preserve the callable proxy, including the child field named "name".
    expect(fixture.componentInstance.f).toBe(f);
    expect(fixture.componentInstance.f!.name).toBe(f.name);
    expect(ngMocks.get('input', FormField).field()).toBe(f.name);
    expect(
      ngMocks.find<HTMLInputElement>('input').nativeElement.value,
    ).toBe('Ada');

    ngMocks.change('input', 'Grace');
    fixture.detectChanges();

    expect(model()).toEqual({ name: 'Grace' });
    expect(f.name().value()).toBe('Grace');
    expect(f.name().dirty()).toBe(true);
    expect(f.name().touched()).toBe(true);

    model.set({ name: 'Katherine' });
    fixture.detectChanges();

    expect(fixture.componentInstance.f).toBe(f);
    expect(ngMocks.get('input', FormField).field()).toBe(f.name);
    expect(
      ngMocks.find<HTMLInputElement>('input').nativeElement.value,
    ).toBe('Katherine');
  });

  it('binds a field passed directly through a custom template', () => {
    const params: {
      field: FieldTree<string> | undefined;
    } = { field: undefined };

    const fixture = MockRender(
      '<input [formField]="field" />',
      params,
      { detectChanges: false, valueKeys: ['field'] },
    );
    const model = signal({ name: 'Ada' });
    const f = TestBed.runInInjectionContext(() => form(model));

    params.field = f.name;
    fixture.detectChanges();

    expect(fixture.componentInstance.field).toBe(f.name);
    expect(ngMocks.get('input', FormField).field()).toBe(f.name);
    expect(
      ngMocks.find<HTMLInputElement>('input').nativeElement.value,
    ).toBe('Ada');

    ngMocks.change('input', 'Grace');
    fixture.detectChanges();

    expect(model()).toEqual({ name: 'Grace' });
    expect(f.name().value()).toBe('Grace');
    expect(f.name().dirty()).toBe(true);
    expect(f.name().touched()).toBe(true);

    model.set({ name: 'Katherine' });
    fixture.detectChanges();

    expect(fixture.componentInstance.field).toBe(f.name);
    expect(ngMocks.get('input', FormField).field()).toBe(f.name);
    expect(
      ngMocks.find<HTMLInputElement>('input').nativeElement.value,
    ).toBe('Katherine');
  });
});
