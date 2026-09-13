import { Directive, input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let transformations = 0;

@Directive({
  selector: '[hostSignal14956]',
  standalone: true,
})
class HostDirective {
  public readonly backingField = input(0, {
    alias: 'original',
    transform: (value: string) => {
      transformations += 1;

      return Number(value) * 2;
    },
  });
  public readonly exposed = 'decoy';
}

@Directive({
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['original: exposed'],
    },
  ],
  selector: '[ownerSignal14956]',
  standalone: true,
})
class OwnerDirective {
  public readonly ordinaryValue = input(0, {
    alias: 'exposed',
    transform: Number,
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14956
describe('issue-14956:signals', () => {
  // The root TypeScript-only runner does not compile directive signal inputs.
  const definition = (
    HostDirective as typeof HostDirective & {
      ɵdir?: { inputs?: { original?: unknown } };
    }
  ).ɵdir;
  if (!definition?.inputs?.original) {
    it('needs compiled signal input metadata', () => {
      expect(definition?.inputs?.original).toBeFalsy();
    });

    return;
  }

  beforeEach(() => {
    transformations = 0;

    return MockBuilder([HostDirective, OwnerDirective]);
  });

  it('reads each stored signal value through a remapped alias without rerunning transforms', () => {
    const fixture = MockRender(
      '<ng-template #target ownerSignal14956 [exposed]="value"></ng-template>',
      { value: '2' },
    );
    const node = ngMocks.reveal(fixture, OwnerDirective);
    const template = ngMocks.findTemplateRef(fixture, 'target');
    const host = ngMocks.get(node, HostDirective);
    const owner = ngMocks.get(node, OwnerDirective);
    const hostValue = host.backingField;
    const ownerValue = owner.ordinaryValue;

    expect(isMockOf(host, HostDirective)).toBe(false);
    expect(isMockOf(owner, OwnerDirective)).toBe(false);
    expect(hostValue()).toBe(4);
    expect(ownerValue()).toBe(2);
    expect(host.exposed).toBe('decoy');
    expect(template.elementRef.nativeElement).toBe(node.nativeNode);
    expect(transformations).toBe(1);

    for (const value of [4, 2]) {
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

    for (const value of ['2', 'decoy', 'missing', undefined]) {
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
    expect(transformations).toBe(1);

    fixture.componentInstance.value = '0';
    fixture.detectChanges();

    expect(host.backingField).toBe(hostValue);
    expect(owner.ordinaryValue).toBe(ownerValue);
    expect(hostValue()).toBe(0);
    expect(ownerValue()).toBe(0);
    expect(host.exposed).toBe('decoy');
    expect(transformations).toBe(2);
    expect(ngMocks.reveal(fixture, ['exposed', 0])).toBe(node);
    expect(ngMocks.revealAll(fixture, ['exposed', 0])).toEqual([
      node,
    ]);
    expect(
      ngMocks.findTemplateRef(fixture, ['exposed', 0]).elementRef
        .nativeElement,
    ).toBe(template.elementRef.nativeElement);
    expect(
      ngMocks
        .findTemplateRefs(fixture, ['exposed', 0])
        .map(result => result.elementRef.nativeElement),
    ).toEqual([template.elementRef.nativeElement]);

    for (const value of [4, 2, '0']) {
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
    expect(transformations).toBe(2);
  });
});
