import { Directive, Input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[hosted14956]',
  standalone: true,
})
class HostDirective {
  @Input('original') public backingField: string | undefined = '';
  @Input() public unchanged = '';
  public exposed = 'decoy';
}

@Directive({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['original: exposed', 'unchanged'],
    },
  ],
  selector: '[owner14956]',
  standalone: true,
})
class OwnerDirective {}

@Directive({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['original: exposed'],
    },
  ],
  selector: '[shared14956]',
  standalone: true,
})
class SharedOwnerDirective {
  @Input('exposed') public ordinaryValue = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14956
describe('issue-14956', () => {
  beforeEach(() =>
    MockBuilder([
      HostDirective,
      OwnerDirective,
      SharedOwnerDirective,
    ]),
  );

  it('resolves the remapped backing input and preserves an unchanged alias', () => {
    const fixture = MockRender(
      '<ng-template #target owner14956 [exposed]="value" [unchanged]="control"></ng-template>',
      { value: 'initial', control: 'control' },
    );
    const node = ngMocks.reveal(fixture, OwnerDirective);
    const template = ngMocks.findTemplateRef(fixture, 'target');
    const host = ngMocks.get(node, HostDirective);
    const owner = ngMocks.get(node, OwnerDirective);

    expect(isMockOf(host, HostDirective)).toBe(false);
    expect(isMockOf(owner, OwnerDirective)).toBe(false);
    expect(host.backingField).toBe('initial');
    expect(host.unchanged).toBe('control');
    expect(host.exposed).toBe('decoy');
    expect(ngMocks.reveal(fixture, HostDirective) as unknown).toBe(
      node,
    );
    expect(template.elementRef.nativeElement).toBe(node.nativeNode);

    // The outer alias must resolve the host input, not the decoy property.
    for (const [attribute, value] of [
      ['exposed', 'initial'],
      ['unchanged', 'control'],
    ]) {
      expect(ngMocks.reveal(fixture, [attribute, value], null)).toBe(
        node,
      );
      expect(ngMocks.revealAll(fixture, [attribute, value])).toEqual([
        node,
      ]);
      const found = ngMocks.findTemplateRef(
        fixture,
        [attribute, value],
        null,
      );
      expect(found && found.elementRef.nativeElement).toBe(
        template.elementRef.nativeElement,
      );
      expect(
        ngMocks
          .findTemplateRefs(fixture, [attribute, value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }

    for (const value of ['decoy', 'missing', undefined]) {
      expect(
        ngMocks.reveal(fixture, ['exposed', value], null),
      ).toBeNull();
      expect(ngMocks.revealAll(fixture, ['exposed', value])).toEqual(
        [],
      );
      expect(
        ngMocks.findTemplateRef(fixture, ['exposed', value], null),
      ).toBeNull();
      expect(
        ngMocks.findTemplateRefs(fixture, ['exposed', value]),
      ).toEqual([]);
    }

    fixture.componentInstance.value = 'updated';
    fixture.componentInstance.control = 'updated control';
    fixture.detectChanges();

    expect(host.backingField).toBe('updated');
    expect(host.unchanged).toBe('updated control');
    expect(host.exposed).toBe('decoy');

    for (const [attribute, value] of [
      ['exposed', 'updated'],
      ['unchanged', 'updated control'],
    ]) {
      expect(ngMocks.reveal(fixture, [attribute, value], null)).toBe(
        node,
      );
      expect(ngMocks.revealAll(fixture, [attribute, value])).toEqual([
        node,
      ]);
      const found = ngMocks.findTemplateRef(
        fixture,
        [attribute, value],
        null,
      );
      expect(found && found.elementRef.nativeElement).toBe(
        template.elementRef.nativeElement,
      );
      expect(
        ngMocks
          .findTemplateRefs(fixture, [attribute, value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }
    expect(
      ngMocks.revealAll(fixture, ['exposed', 'initial']),
    ).toEqual([]);
    expect(
      ngMocks.findTemplateRefs(fixture, ['unchanged', 'control']),
    ).toEqual([]);
  });

  it('resolves each host and ordinary input sharing the exposed alias', () => {
    const fixture = MockRender(
      '<ng-template #target shared14956 [exposed]="value"></ng-template>',
      { value: 'initial' },
    );
    const node = ngMocks.reveal(fixture, SharedOwnerDirective);
    const template = ngMocks.findTemplateRef(fixture, 'target');
    const host = ngMocks.get(node, HostDirective);
    const owner = ngMocks.get(node, SharedOwnerDirective);

    expect(isMockOf(host, HostDirective)).toBe(false);
    expect(isMockOf(owner, SharedOwnerDirective)).toBe(false);
    expect(host.backingField).toBe('initial');
    expect(owner.ordinaryValue).toBe('initial');
    expect(ngMocks.reveal(fixture, HostDirective) as unknown).toBe(
      node,
    );
    expect(template.elementRef.nativeElement).toBe(node.nativeNode);

    host.backingField = 'host stored';
    owner.ordinaryValue = 'ordinary stored';

    for (const value of ['host stored', 'ordinary stored']) {
      expect(ngMocks.reveal(fixture, ['exposed', value], null)).toBe(
        node,
      );
      expect(ngMocks.revealAll(fixture, ['exposed', value])).toEqual([
        node,
      ]);
      const found = ngMocks.findTemplateRef(
        fixture,
        ['exposed', value],
        null,
      );
      expect(found && found.elementRef.nativeElement).toBe(
        template.elementRef.nativeElement,
      );
      expect(
        ngMocks
          .findTemplateRefs(fixture, ['exposed', value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }

    for (const value of ['decoy', 'missing', undefined]) {
      expect(
        ngMocks.reveal(fixture, ['exposed', value], null),
      ).toBeNull();
      expect(ngMocks.revealAll(fixture, ['exposed', value])).toEqual(
        [],
      );
      expect(
        ngMocks.findTemplateRef(fixture, ['exposed', value], null),
      ).toBeNull();
      expect(
        ngMocks.findTemplateRefs(fixture, ['exposed', value]),
      ).toEqual([]);
    }

    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();

    expect(host.backingField).toBe('updated');
    expect(owner.ordinaryValue).toBe('updated');
    expect(host.exposed).toBe('decoy');
    expect(ngMocks.reveal(fixture, ['exposed', 'updated'])).toBe(
      node,
    );
    expect(
      ngMocks.revealAll(fixture, ['exposed', 'updated']),
    ).toEqual([node]);
    expect(
      ngMocks.findTemplateRef(fixture, ['exposed', 'updated'])
        .elementRef.nativeElement,
    ).toBe(template.elementRef.nativeElement);
    expect(
      ngMocks
        .findTemplateRefs(fixture, ['exposed', 'updated'])
        .map(result => result.elementRef.nativeElement),
    ).toEqual([template.elementRef.nativeElement]);
    expect(
      ngMocks.revealAll(fixture, ['exposed', 'host stored']),
    ).toEqual([]);
    expect(
      ngMocks.findTemplateRefs(fixture, [
        'exposed',
        'ordinary stored',
      ]),
    ).toEqual([]);

    host.backingField = undefined;

    expect(owner.ordinaryValue).toBe('updated');
    expect(
      ngMocks.reveal(fixture, ['exposed', undefined], null),
    ).toBe(node);
    expect(
      ngMocks.revealAll(fixture, ['exposed', undefined]),
    ).toEqual([node]);
    const found = ngMocks.findTemplateRef(
      fixture,
      ['exposed', undefined],
      null,
    );
    expect(found && found.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(
      ngMocks
        .findTemplateRefs(fixture, ['exposed', undefined])
        .map(result => result.elementRef.nativeElement),
    ).toEqual([template.elementRef.nativeElement]);
  });
});
