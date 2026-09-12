import { Directive, Input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[hosted14923]',
  standalone: true,
})
class HostDirective {
  @Input() public shared = '';
}

@Directive({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['shared'],
    },
  ],
  selector: '[owner14923]',
  standalone: true,
})
class OwnerDirective {
  @Input('shared') public ownValue = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14923
describe('issue-14923:host-directives', () => {
  beforeEach(() => MockBuilder([OwnerDirective, HostDirective]));

  it('finds both host and ordinary directive values through an unchanged shared alias', () => {
    const fixture = MockRender(
      '<ng-template #target owner14923 [shared]="value"></ng-template>',
      { value: 'initial' },
    );
    const node = ngMocks.reveal(fixture, OwnerDirective);
    const template = ngMocks.findTemplateRef(fixture, 'target');
    const host = ngMocks.get(node, HostDirective);
    const owner = ngMocks.get(node, OwnerDirective);

    expect(isMockOf(host, HostDirective)).toBe(false);
    expect(isMockOf(owner, OwnerDirective)).toBe(false);
    expect(host.shared).toBe('initial');
    expect(owner.ownValue).toBe('initial');
    expect(ngMocks.reveal(fixture, HostDirective) as unknown).toBe(
      node,
    );
    expect(template.elementRef.nativeElement).toBe(node.nativeNode);

    // Newer Angular versions keep host input indices in a separate node map.
    host.shared = 'hosted';
    owner.ownValue = 'ordinary';

    for (const value of ['hosted', 'ordinary']) {
      expect(ngMocks.reveal(fixture, ['shared', value], null)).toBe(
        node,
      );
      expect(ngMocks.revealAll(fixture, ['shared', value])).toEqual([
        node,
      ]);
      const found = ngMocks.findTemplateRef(
        fixture,
        ['shared', value],
        null,
      );
      expect(found && found.elementRef.nativeElement).toBe(
        template.elementRef.nativeElement,
      );
      expect(
        ngMocks
          .findTemplateRefs(fixture, ['shared', value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }

    for (const value of ['missing', undefined]) {
      expect(
        ngMocks.reveal(fixture, ['shared', value], null),
      ).toBeNull();
      expect(ngMocks.revealAll(fixture, ['shared', value])).toEqual(
        [],
      );
      expect(
        ngMocks.findTemplateRef(fixture, ['shared', value], null),
      ).toBeNull();
      expect(
        ngMocks.findTemplateRefs(fixture, ['shared', value]),
      ).toEqual([]);
    }

    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();

    expect(host.shared).toBe('updated');
    expect(owner.ownValue).toBe('updated');
    expect(ngMocks.reveal(fixture, ['shared', 'updated'])).toBe(node);
    expect(ngMocks.revealAll(fixture, ['shared', 'updated'])).toEqual(
      [node],
    );
    expect(
      ngMocks.findTemplateRef(fixture, ['shared', 'updated'])
        .elementRef.nativeElement,
    ).toBe(template.elementRef.nativeElement);
    expect(
      ngMocks
        .findTemplateRefs(fixture, ['shared', 'updated'])
        .map(result => result.elementRef.nativeElement),
    ).toEqual([template.elementRef.nativeElement]);
    expect(ngMocks.revealAll(fixture, ['shared', 'hosted'])).toEqual(
      [],
    );
    expect(
      ngMocks.findTemplateRefs(fixture, ['shared', 'ordinary']),
    ).toEqual([]);
  });
});
