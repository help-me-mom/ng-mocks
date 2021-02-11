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
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const ngSelectEl = ngMocks.find(NgSelectComponent);

    expect(ngMocks.input(ngSelectEl, 'items')).toBe(
      targetComponent.cities,
    );
    expect(ngMocks.input(ngSelectEl, 'groupBy')).toEqual('avatar');
    expect(ngMocks.input(ngSelectEl, 'bindLabel')).toEqual('name');
    expect(ngMocks.input(ngSelectEl, 'bindValue')).toEqual('name');
    expect(ngMocks.input(ngSelectEl, 'ngModel')).toBe(
      targetComponent.selectedCity,
    );
  });

  it('binds outputs', () => {
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const ngSelectEl = ngMocks.find(NgSelectComponent);

    ngMocks.output(ngSelectEl, 'ngModelChange').emit('test');
    expect(targetComponent.selectedCity).toEqual('test');
  });

  it('provides correct template for ng-label-tmp', () => {
    MockRender(TargetComponent);
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['labelTemplate'],
        {},
        { item: { name: 'test' } },
      );
    }
    const tplEl = ngMocks.find('[data-prop="labelTemplate"]');
    expect(tplEl.nativeElement.innerHTML).toContain(
      '<strong>test</strong>',
    );
  });

  it('provides correct template for ng-optgroup-tmp', () => {
    MockRender(TargetComponent);
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['optgroupTemplate'],
        {},
        {
          index: 7,
          item: {
            avatar: 'test.jpeg',
            name: 'test',
          },
        },
      );
    }
    const tplEl = ngMocks.find('[data-prop="optgroupTemplate"]');
    expect(tplEl.nativeElement.innerHTML).toContain(
      '7 <img src="test.jpeg" alt="test">',
    );
  });

  it('provides correct template for ng-option-tmp', () => {
    MockRender(TargetComponent);
    const ngSelect = ngMocks.findInstance(NgSelectComponent);

    if (isMockOf(ngSelect, NgSelectComponent, 'c')) {
      ngSelect.__render(
        ['optionTemplate'],
        {},
        {
          item: {
            name: 'test',
          },
          searchTerm: 'search',
        },
      );
    }
    const labelEl = ngMocks.find('[data-prop="optionTemplate"]');
    expect(labelEl.nativeElement.innerHTML).toContain(
      '<span class="ng-option-tmp">search test</span>',
    );
  });
});
