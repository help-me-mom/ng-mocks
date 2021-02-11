import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgSelectComponent,
  NgSelectModule,
} from '@ng-select/ng-select';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: `
    <ng-select
      [items]="cities"
      groupBy="avatar"
      [(ngModel)]="selectedCity"
      bindLabel="name"
      bindValue="name"
    >
      <ng-template ng-label-tmp let-item="item">
        <strong>{{ item.name }}</strong>
      </ng-template>
      <ng-template ng-optgroup-tmp let-item="item" let-index="index">
        {{ index }} <img [src]="item.avatar" [alt]="item.name" />
      </ng-template>
      <ng-template
        ng-option-tmp
        let-item="item"
        let-index="index"
        let-search="searchTerm"
      >
        <span class="ng-option-tmp"
          >{{ search }} {{ item.name }}</span
        >
      </ng-template>
    </ng-select>
  `,
})
class TargetComponent {
  public readonly cities = [
    {
      avatar:
        '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x',
      id: 1,
      name: 'Vilnius',
    },
  ];

  public selectedCity = this.cities[0].name;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [NgSelectModule, FormsModule],
})
class TargetModule {}

describe('ng-select:props', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('binds inputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;

    // Looking for a debug element of `NgSelectComponent`.
    const ngSelectEl = ngMocks.find(NgSelectComponent);

    // Asserting bound properties.
    expect(ngMocks.input(ngSelectEl, 'items')).toBe(
      targetComponent.cities,
    );
    expect(ngMocks.input(ngSelectEl, 'ngModel')).toBe(
      targetComponent.selectedCity,
    );

    // Asserting static properties.
    expect(ngMocks.input(ngSelectEl, 'groupBy')).toEqual('avatar');
    expect(ngMocks.input(ngSelectEl, 'bindLabel')).toEqual('name');
    expect(ngMocks.input(ngSelectEl, 'bindValue')).toEqual('name');
  });

  it('binds outputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;

    // Looking for a debug element of `NgSelectComponent`.
    const ngSelectEl = ngMocks.find(NgSelectComponent);

    // Simulating an emit.
    ngMocks.output(ngSelectEl, 'ngModelChange').emit('test');

    // Asserting the effect of the emit.
    expect(targetComponent.selectedCity).toEqual('test');
  });

  it('provides correct template for ng-label-tmp', () => {
    // Rendering TargetComponent.
    MockRender(TargetComponent);

    // Looking for the instance of `NgSelectComponent`.
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    // Verifying that the instance has been mocked.
    // And rendering its property,
    // which points to the desired TemplateRef.
    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['labelTemplate'],
        {},
        // Providing context variables.
        { item: { name: 'test' } },
      );
    }

    // Looking for a debug element of the rendered TemplateRef.
    const tplEl = ngMocks.find('[data-prop="labelTemplate"]');

    // Asserting the rendered html.
    expect(tplEl.nativeElement.innerHTML).toContain(
      '<strong>test</strong>',
    );
  });

  it('provides correct template for ng-optgroup-tmp', () => {
    // Rendering TargetComponent and accessing its instance.
    MockRender(TargetComponent);

    // Looking for the instance of `NgSelectComponent`.
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    // Verifying that the instance has been mocked.
    // And rendering its property,
    // which points to the desired TemplateRef.
    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['optgroupTemplate'],
        {},
        // Providing context variables.
        {
          index: 7,
          item: {
            avatar: 'test.jpeg',
            name: 'test',
          },
        },
      );
    }

    // Looking for a debug element of the rendered TemplateRef.
    const tplEl = ngMocks.find('[data-prop="optgroupTemplate"]');

    // Asserting the rendered html.
    expect(tplEl.nativeElement.innerHTML).toContain(
      '7 <img src="test.jpeg" alt="test">',
    );
  });

  it('provides correct template for ng-option-tmp', () => {
    // Rendering TargetComponent and accessing its instance.
    MockRender(TargetComponent);

    // Looking for the instance of `NgSelectComponent`.
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    // Verifying that the instance has been mocked.
    // And rendering its property,
    // which points to the desired TemplateRef.
    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['optionTemplate'],
        {},
        // Providing context variables.
        {
          item: {
            name: 'test',
          },
          searchTerm: 'search',
        },
      );
    }

    // Looking for a debug element of the rendered TemplateRef.
    const labelEl = ngMocks.find('[data-prop="optionTemplate"]');

    // Asserting the rendered html.
    expect(labelEl.nativeElement.innerHTML).toContain(
      '<span class="ng-option-tmp">search test</span>',
    );
  });
});
