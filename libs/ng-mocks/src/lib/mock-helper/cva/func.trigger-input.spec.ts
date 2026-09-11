import { DebugElement } from '@angular/core';

import funcTriggerInput from './func.trigger-input';

describe('func.trigger-input', () => {
  it('preserves event order and numeric text events without leaving a shadow value', () => {
    const input = document.createElement('input');
    input.value = 'initial';
    const events: Array<[string, any]> = [];
    for (const name of ['focus', 'input', 'change', 'blur']) {
      input.addEventListener(name, () =>
        events.push([name, input.value]),
      );
    }

    funcTriggerInput({ nativeElement: input } as DebugElement, 123);

    expect(events).toEqual([
      ['focus', 'initial'],
      ['input', 123],
      ['change', 123],
      ['blur', 123],
    ]);
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();
    expect(input.value).toBe('123');

    input.value = 'next';
    expect(input.value).toBe('next');
  });

  it('restores the textarea setter after raw-value input events', () => {
    const textarea = document.createElement('textarea');
    const values: any[] = [];
    textarea.addEventListener('input', () =>
      values.push(textarea.value),
    );

    funcTriggerInput(
      { nativeElement: textarea } as DebugElement,
      123,
    );

    expect(values).toEqual([123]);
    expect(textarea.value).toBe('123');
    expect(
      Object.getOwnPropertyDescriptor(textarea, 'value'),
    ).toBeUndefined();

    textarea.value = 'next';
    expect(textarea.value).toBe('next');
  });

  it('preserves a value normalized by the input listener', () => {
    const input = document.createElement('input');
    const values: string[] = [];
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });
    input.addEventListener('change', () => values.push(input.value));

    funcTriggerInput(
      { nativeElement: input } as DebugElement,
      'updated',
    );

    expect(values).toEqual(['UPDATED']);
    expect(input.value).toBe('UPDATED');
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();
  });

  it('changes checkbox state without replacing its option value', () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = 'option';
    const values: boolean[] = [];
    input.addEventListener('input', () => values.push(input.checked));

    funcTriggerInput({ nativeElement: input } as DebugElement, true);
    funcTriggerInput({ nativeElement: input } as DebugElement, false);

    expect(values).toEqual([true, false]);
    expect(input.checked).toBe(false);
    expect(input.value).toBe('option');
  });

  it('preserves raw file input events without invoking the restricted native setter', () => {
    const input = document.createElement('input');
    input.type = 'file';
    const values: string[] = [];
    for (const name of ['input', 'change', 'blur']) {
      input.addEventListener(name, () => values.push(input.value));
    }

    expect(() =>
      funcTriggerInput(
        { nativeElement: input } as DebugElement,
        'selected.txt',
      ),
    ).not.toThrow();

    expect(values).toEqual([
      'selected.txt',
      'selected.txt',
      'selected.txt',
    ]);
  });

  for (const type of ['number', 'range', 'datetime-local']) {
    it(`updates the native numeric value of ${type} inputs`, () => {
      const input = document.createElement('input');
      input.type = type;
      const values: number[] = [];
      input.addEventListener('input', () =>
        values.push(input.valueAsNumber),
      );

      funcTriggerInput({ nativeElement: input } as DebugElement, 42);

      expect(values).toEqual([42]);
      expect(input.valueAsNumber).toBe(42);
      expect(
        Object.getOwnPropertyDescriptor(input, 'value'),
      ).toBeUndefined();
    });
  }

  it('parses numeric text and clears a numeric value with null', () => {
    const input = document.createElement('input');
    input.type = 'number';

    funcTriggerInput(
      { nativeElement: input } as DebugElement,
      '23.5',
    );
    expect(input.valueAsNumber).toBe(23.5);

    funcTriggerInput({ nativeElement: input } as DebugElement, null);
    expect(input.value).toBe('');
    expect(input.valueAsNumber).toBeNaN();
  });

  it('preserves raw numeric events when valueAsNumber is unavailable', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = '7';
    Object.defineProperty(input, 'valueAsNumber', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const values: any[] = [];
    for (const name of ['input', 'change', 'blur']) {
      input.addEventListener(name, () => values.push(input.value));
    }

    funcTriggerInput({ nativeElement: input } as DebugElement, 42);

    expect(values).toEqual([42, 42, 42]);
    expect(input.valueAsNumber).toBeUndefined();
    expect(input.value).toBe('42');
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();

    input.value = '23.5';
    expect(input.value).toBe('23.5');
  });

  it('writes and clears native Date values', () => {
    const input = document.createElement('input');
    input.type = 'date';
    const value = new Date('2024-06-15T00:00:00.000Z');

    funcTriggerInput({ nativeElement: input } as DebugElement, value);
    expect(input.valueAsDate).toEqual(value);
    expect(input.value).toBe('2024-06-15');

    funcTriggerInput({ nativeElement: input } as DebugElement, null);
    expect(input.valueAsDate).toBeNull();
    expect(input.value).toBe('');
  });

  it('supports numeric and string date values through native setters', () => {
    const input = document.createElement('input');
    input.type = 'date';

    funcTriggerInput(
      { nativeElement: input } as DebugElement,
      Date.UTC(2024, 5, 15),
    );
    expect(input.value).toBe('2024-06-15');

    funcTriggerInput(
      { nativeElement: input } as DebugElement,
      '2024-07-20',
    );
    expect(input.valueAsDate).toEqual(
      new Date('2024-07-20T00:00:00.000Z'),
    );
  });

  it('preserves raw Date and null events when valueAsDate is unavailable', () => {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = '2024-01-01';
    Object.defineProperty(input, 'valueAsDate', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const value = new Date('2024-06-15T00:00:00.000Z');
    const values: any[] = [];
    for (const name of ['input', 'change', 'blur']) {
      input.addEventListener(name, () => values.push(input.value));
    }

    funcTriggerInput({ nativeElement: input } as DebugElement, value);
    funcTriggerInput({ nativeElement: input } as DebugElement, null);

    expect(values).toEqual([value, value, value, null, null, null]);
    expect(input.valueAsDate).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();

    input.value = '2024-07-20';
    expect(input.value).toBe('2024-07-20');
  });

  it('preserves raw numeric date events when valueAsNumber is unavailable', () => {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = '2024-01-01';
    Object.defineProperty(input, 'valueAsNumber', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const value = Date.UTC(2024, 5, 15);
    const values: any[] = [];
    for (const name of ['input', 'change', 'blur']) {
      input.addEventListener(name, () => values.push(input.value));
    }

    funcTriggerInput({ nativeElement: input } as DebugElement, value);

    expect(values).toEqual([value, value, value]);
    expect(input.valueAsNumber).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();

    input.value = '2024-07-20';
    expect(input.value).toBe('2024-07-20');
  });

  it('updates selected options and leaves later selection changes usable', () => {
    const select = document.createElement('select');
    select.innerHTML =
      '<option value="first">First</option><option value="second">Second</option>';
    const selected: number[] = [];
    select.addEventListener('change', () =>
      selected.push(select.selectedIndex),
    );

    funcTriggerInput(
      { nativeElement: select } as DebugElement,
      'second',
    );

    expect(selected).toEqual([1]);
    expect(select.options[1].selected).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(select, 'value'),
    ).toBeUndefined();

    select.value = 'first';
    expect(select.selectedIndex).toBe(0);
  });

  it('preserves an unmatched select value in events without leaving a shadow property', () => {
    const select = document.createElement('select');
    select.innerHTML =
      '<option value="first">First</option><option value="second">Second</option>';
    const values: string[] = [];
    for (const name of ['input', 'change', 'blur']) {
      select.addEventListener(name, () => values.push(select.value));
    }

    funcTriggerInput(
      { nativeElement: select } as DebugElement,
      'missing',
    );

    expect(values).toEqual(['missing', 'missing', 'missing']);
    expect(select.value).toBe('');
    expect(select.selectedIndex).toBe(-1);
    expect(
      Object.getOwnPropertyDescriptor(select, 'value'),
    ).toBeUndefined();

    select.value = 'first';
    expect(select.selectedIndex).toBe(0);
  });

  it('preserves selection normalized by an unmatched-value listener', () => {
    const select = document.createElement('select');
    select.innerHTML =
      '<option value="first">First</option><option value="second">Second</option>';
    const values: string[] = [];
    select.addEventListener('change', () => {
      values.push(select.value);
      select.selectedIndex = 1;
    });

    funcTriggerInput(
      { nativeElement: select } as DebugElement,
      'missing',
    );

    expect(values).toEqual(['missing']);
    expect(select.selectedIndex).toBe(1);
    expect(select.options[1].selected).toBe(true);
    expect(select.value).toBe('second');
    expect(
      Object.getOwnPropertyDescriptor(select, 'value'),
    ).toBeUndefined();
  });

  it('applies a select value normalized by its event listener', () => {
    const select = document.createElement('select');
    select.innerHTML =
      '<option value="first">First</option><option value="second">Second</option>';
    select.addEventListener('change', () => {
      select.value = 'second';
    });

    funcTriggerInput(
      { nativeElement: select } as DebugElement,
      'missing',
    );

    expect(select.value).toBe('second');
    expect(select.selectedIndex).toBe(1);
    expect(
      Object.getOwnPropertyDescriptor(select, 'value'),
    ).toBeUndefined();
  });

  it('preserves raw values on custom event hosts', () => {
    const element = document.createElement(
      'custom-control',
    ) as HTMLElement & { value: any };
    const value = { name: 'updated' };
    const values: any[] = [];
    element.addEventListener('input', () =>
      values.push(element.value),
    );
    element.addEventListener('blur', () =>
      values.push(element.value),
    );

    funcTriggerInput(
      { nativeElement: element } as DebugElement,
      value,
    );

    expect(values).toEqual([value, value]);
    expect(element.value).toBe(value);
  });

  it('restores an existing native value accessor after dispatch fails', () => {
    const element = document.createElement('input');
    const getter = jasmine
      .createSpy('get')
      .and.returnValue('initial');
    const setter = jasmine.createSpy('set');
    const descriptor = {
      configurable: true,
      enumerable: false,
      get: getter,
      set: setter,
    };
    Object.defineProperty(element, 'value', descriptor);
    spyOn(element, 'dispatchEvent').and.callFake((event: Event) => {
      if (event.type === 'change') {
        throw new Error('dispatch failed');
      }
      return true;
    });

    expect(() =>
      funcTriggerInput(
        { nativeElement: element } as DebugElement,
        123,
      ),
    ).toThrowError('dispatch failed');

    expect(Object.getOwnPropertyDescriptor(element, 'value')).toEqual(
      descriptor,
    );
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith(123);
  });

  it('restores an existing native value accessor before blur', () => {
    const input = document.createElement('input');
    const getter = jasmine
      .createSpy('get')
      .and.returnValue('restored');
    const setter = jasmine.createSpy('set');
    const descriptor = {
      configurable: true,
      get: getter,
      set: setter,
    };
    Object.defineProperty(input, 'value', descriptor);
    const values: any[] = [];
    input.addEventListener('input', () => values.push(input.value));
    input.addEventListener('blur', () => values.push(input.value));

    funcTriggerInput({ nativeElement: input } as DebugElement, 123);

    expect(values).toEqual([123, 'restored']);
    expect(Object.getOwnPropertyDescriptor(input, 'value')?.get).toBe(
      getter,
    );
    expect(Object.getOwnPropertyDescriptor(input, 'value')?.set).toBe(
      setter,
    );
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith(123);
  });

  for (const eventName of ['input', 'blur']) {
    it(`removes a temporary native value property when ${eventName} dispatch fails`, () => {
      const input = document.createElement('input');
      spyOn(input, 'dispatchEvent').and.callFake((event: Event) => {
        if (event.type === eventName) {
          throw new Error('dispatch failed');
        }
        return true;
      });

      expect(() =>
        funcTriggerInput(
          { nativeElement: input } as DebugElement,
          'updated',
        ),
      ).toThrowError('dispatch failed');

      expect(
        Object.getOwnPropertyDescriptor(input, 'value'),
      ).toBeUndefined();
      expect(input.value).toBe('updated');
      input.value = 'next';
      expect(input.value).toBe('next');
    });
  }
});
