import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'classic-select',
  template: '',
})
class ClassicSelectComponent {
  @Input() public value: string | null = null;
  @Output() public readonly valueChange = new EventEmitter<
    string | null
  >();
}

@Component({
  selector: 'target-classic-model-control',
  imports: [FormField, ClassicSelectComponent],
  template: '<classic-select [formField]="f.name" />',
})
class TargetComponent {
  public readonly model = signal({ name: '' });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15034#issuecomment-5679943941
// Angular connects a classic value/valueChange pair without requiring a signal input.
describe('issue-15034:classic-model', () => {
  for (const mode of ['TestBed', 'kept', 'mocked']) {
    describe(`${mode} child with real FormField`, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          return TestBed.configureTestingModule({
            imports: [TargetComponent],
          }).compileComponents();
        }

        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'kept'
          ? builder.keep(ClassicSelectComponent)
          : builder.mock(ClassicSelectComponent);
      });

      it('changes the field through ngMocks.change', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;

        // This is the reported failure; keep the desired result as the assertion.
        ngMocks.change('classic-select', 'Ada');
        fixture.detectChanges();

        expect(component.model()).toEqual({ name: 'Ada' });
        expect(component.f.name().dirty()).toBe(true);
        expect(component.f.name().touched()).toBe(false);
      });

      it('updates the same field through the connected classic output', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find(ClassicSelectComponent);
        const child = ngMocks.get(input, ClassicSelectComponent);
        const values: Array<string | null> = [];
        ngMocks
          .output(input, 'valueChange')
          .subscribe(value => values.push(value));

        expect(isMockOf(child, ClassicSelectComponent)).toBe(
          mode === 'mocked',
        );
        expect(
          isMockOf(ngMocks.get(input, FormField), FormField),
        ).toBe(false);
        expect(child.value).toBe('');

        // The output proves Angular already established a working custom-control connection.
        ngMocks.output(input, 'valueChange').emit('Ada');
        fixture.detectChanges();

        expect(component.model()).toEqual({ name: 'Ada' });
        expect(component.f.name().value()).toBe('Ada');
        expect(component.f.name().dirty()).toBe(true);
        expect(component.f.name().touched()).toBe(false);
        expect(child.value).toBe('Ada');
        expect(values).toEqual(['Ada']);
      });
    });
  }

  describe('mocked FormField', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('uses the existing mocked-binding fallback without emitting the child output', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find(ClassicSelectComponent);
      const values: Array<string | null> = [];
      ngMocks
        .output(input, 'valueChange')
        .subscribe(value => values.push(value));

      // This already-supported route is distinct from Angular's real output connection.
      ngMocks.change(input, 'Ada');
      fixture.detectChanges();

      expect(component.model()).toEqual({ name: 'Ada' });
      expect(component.f.name().dirty()).toBe(true);
      expect(component.f.name().touched()).toBe(false);
      expect(values).toEqual([]);
    });
  });
});
