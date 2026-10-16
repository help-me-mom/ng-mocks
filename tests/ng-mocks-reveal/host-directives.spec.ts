import { Directive, Input } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[hosted]',
  standalone: true,
})
class HostDirective {
  @Input('original') public value: string | undefined = 'default';
}

@Directive({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['original: exposed'],
    },
  ],
  selector: '[owner]',
  standalone: true,
})
class OwnerDirective {
  @Input() public ordinary: string | undefined = 'default';
}

describe('ng-mocks-reveal:host-directives', () => {
  beforeEach(() => MockBuilder([OwnerDirective, HostDirective]));

  it('ignores inherited input-map names on static attributes', () => {
    const fixture = MockRender(
      '<ng-template owner constructor="static" [exposed]="value"></ng-template>',
      { value: 'initial' },
    );

    expect(ngMocks.reveal(fixture, ['constructor'], null)).toBeNull();
    expect(ngMocks.revealAll(fixture, ['constructor'])).toEqual([]);
    expect(
      ngMocks.findTemplateRef(fixture, ['constructor'], null),
    ).toBeNull();
    expect(
      ngMocks.findTemplateRefs(fixture, ['constructor']),
    ).toEqual([]);
    expect(
      ngMocks.reveal(fixture, ['constructor', 'static'], null),
    ).toBeNull();
    expect(
      ngMocks.revealAll(fixture, ['constructor', 'static']),
    ).toEqual([]);
    expect(
      ngMocks.findTemplateRef(
        fixture,
        ['constructor', 'static'],
        null,
      ),
    ).toBeNull();
    expect(
      ngMocks.findTemplateRefs(fixture, ['constructor', 'static']),
    ).toEqual([]);
  });

  it('finds bound exposed host inputs alongside ordinary inputs', () => {
    const fixture = MockRender(
      `
        <ng-template #bound owner [exposed]="value" [ordinary]="value"></ng-template>
        <ng-template owner></ng-template>
      `,
      { value: 'initial' },
    );
    const node = ngMocks.reveal(fixture, '#bound');
    const template = ngMocks.findTemplateRef(fixture, 'bound');

    // Neither directive selector contains the exposed input alias.
    for (const input of ['exposed', 'ordinary']) {
      expect(ngMocks.reveal(fixture, [input], null)).toBe(node);
      expect(ngMocks.revealAll(fixture, [input])).toEqual([node]);
      const found = ngMocks.findTemplateRef(fixture, [input], null);
      expect(found && found.elementRef.nativeElement).toBe(
        template.elementRef.nativeElement,
      );
      expect(
        ngMocks
          .findTemplateRefs(fixture, [input])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }
    expect(ngMocks.get(node, HostDirective).value).toBe('initial');
    expect(ngMocks.get(node, OwnerDirective).ordinary).toBe(
      'initial',
    );
    expect(ngMocks.reveal(fixture, ['exposed', 'initial'])).toBe(
      node,
    );
  });

  it('matches bound undefined host inputs without matching unbound inputs', () => {
    const fixture = MockRender(
      `
        <ng-template #bound owner [exposed]="value"></ng-template>
        <ng-template owner></ng-template>
      `,
      { value: undefined },
    );
    const node = ngMocks.reveal(fixture, '#bound');
    const template = ngMocks.findTemplateRef(fixture, 'bound');

    expect(ngMocks.get(node, HostDirective).value).toBeUndefined();
    expect(ngMocks.reveal(fixture, ['exposed'], null)).toBe(node);
    expect(ngMocks.revealAll(fixture, ['exposed'])).toEqual([node]);
    const found = ngMocks.findTemplateRef(fixture, ['exposed'], null);
    expect(found && found.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(
      ngMocks
        .findTemplateRefs(fixture, ['exposed'])
        .map(result => result.elementRef.nativeElement),
    ).toEqual([template.elementRef.nativeElement]);
    expect(ngMocks.reveal(fixture, ['ordinary'], null)).toBeNull();
    expect(ngMocks.revealAll(fixture, ['ordinary'])).toEqual([]);
    expect(ngMocks.findTemplateRefs(fixture, ['ordinary'])).toEqual(
      [],
    );
  });
});
