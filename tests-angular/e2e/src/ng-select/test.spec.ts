import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;

    // Looking for a debug element of the ng-select.
    const ngSelectEl = ngMocks.find('ng-select');

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
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;

    // Looking for a debug element of the ng-select.
    const ngSelectEl = ngMocks.find('ng-select');

    // Simulating an emit.
    ngMocks.output(ngSelectEl, 'ngModelChange').emit('test');

    // Asserting the effect of the emit.
    expect(targetComponent.selectedCity).toEqual('test');
  });

  it('provides correct template for ng-label-tmp', () => {
    // Rendering TargetComponent.
    MockRender(TargetComponent);

    // Looking for a debug element of the ng-select.
    const ngSelectEl = ngMocks.find('ng-select');

    // Looking for the ng-label-tmp template
    const ngLabelTmp = ngMocks.findTemplateRef(
      ngSelectEl,
      // attr name
      ['ng-label-tmp'],
    );

    // Verifies that ngSelect can access ngLabelTmp,
    // and renders it.
    ngMocks.render(
      ngSelectEl.componentInstance,
      ngLabelTmp,
      {},
      // Providing context variables.
      { item: { name: 'test' } },
    );

    // Asserting the rendered html.
    expect(ngSelectEl.nativeElement.innerHTML).toContain(
      '<strong>test</strong>',
    );
  });

  it('provides correct template for ng-optgroup-tmp', () => {
    // Rendering TargetComponent and accessing its instance.
    MockRender(TargetComponent);

    // Looking for a debug element of the ng-select.
    const ngSelectEl = ngMocks.find('ng-select');

    // Looking for the ng-optgroup-tmp template
    const ngOptgroupTmp = ngMocks.findTemplateRef(
      ngSelectEl,
      // attr name
      ['ng-optgroup-tmp'],
    );

    // Verifies that ngSelect can access ngOptgroupTmp,
    // and renders it.
    ngMocks.render(
      ngSelectEl.componentInstance,
      ngOptgroupTmp,
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

    // Asserting the rendered html.
    expect(ngSelectEl.nativeElement.innerHTML).toContain(
      '7 <img src="test.jpeg" alt="test">',
    );
  });

  it('provides correct template for ng-option-tmp', () => {
    // Rendering TargetComponent and accessing its instance.
    MockRender(TargetComponent);

    // Looking for a debug element of the ng-select.
    const ngSelectEl = ngMocks.find('ng-select');

    // Looking for the ng-option-tmp template
    const ngOptionTmp = ngMocks.findTemplateRef(
      ngSelectEl,
      // attr name
      ['ng-option-tmp'],
    );

    // Verifying that the instance has been mocked.
    // And rendering its property,
    // which points to the desired TemplateRef.
    ngMocks.render(
      ngSelectEl.componentInstance,
      ngOptionTmp,
      {},
      // Providing context variables.
      {
        item: {
          name: 'test',
        },
        searchTerm: 'search',
      },
    );

    // Asserting the rendered html.
    expect(ngSelectEl.nativeElement.innerHTML).toContain(
      '<span class="ng-option-tmp">search test</span>',
    );
  });
});
