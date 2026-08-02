import {
  Component,
  input,
  NgModule,
  reflectComponentType,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

interface Item {
  name: string;
}

@Component({
  selector: 'target-13089',
  standalone: false,
  template: `
    @for (item of items(); track item) {
      {{ item.name().value() }}
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

// @see https://github.com/help-me-mom/ng-mocks/issues/13089
describe('issue-13089', () => {
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

  it('preserves callable input values', () => {
    const factory = MockRenderFactory(TargetComponent, ['items']);
    factory.configureTestBed();
    const formState = signal({ items: [{ name: 'initial' }] });
    const formModel = TestBed.runInInjectionContext(() =>
      form(formState),
    );

    const fixture = factory({ items: formModel.items });

    expect(fixture.point.componentInstance.items()).toBe(
      formModel.items,
    );
    expect(ngMocks.formatText(fixture)).toContain('initial');

    formState.set({ items: [{ name: 'updated' }] });
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toContain('updated');
  });
});
