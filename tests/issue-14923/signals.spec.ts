import { Directive, input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let transformations = 0;

@Directive({
  selector: '[firstSignal14923]',
  standalone: true,
})
class FirstDirective {
  public readonly firstValue = input('first-default', {
    alias: 'shared',
  });
}

@Directive({
  selector: '[secondSignal14923]',
  standalone: true,
})
class SecondDirective {
  public readonly secondValue = input('second-default', {
    alias: 'shared',
    transform: (value: string) => {
      transformations += 1;

      return `transformed:${value}`;
    },
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14923
describe('issue-14923:signals', () => {
  // The root TypeScript-only runner does not compile directive signal inputs.
  const definition = (
    FirstDirective as typeof FirstDirective & {
      ɵdir?: { inputs?: { shared?: unknown } };
    }
  ).ɵdir;
  if (!definition?.inputs?.shared) {
    it('needs compiled signal input metadata', () => {
      expect(definition?.inputs?.shared).toBeFalsy();
    });

    return;
  }

  beforeEach(() => {
    transformations = 0;

    // Mock signal inputs omit original transforms, so keep both directives real.
    return MockBuilder([FirstDirective, SecondDirective]);
  });

  it('finds each stored signal value through its shared alias before and after updates', () => {
    const fixture = MockRender(
      '<ng-template #target firstSignal14923 secondSignal14923 [shared]="value"></ng-template>',
      { value: 'initial' },
    );
    const node = ngMocks.reveal(fixture, FirstDirective);
    const template = ngMocks.findTemplateRef(fixture, 'target');
    const first = ngMocks.get(node, FirstDirective);
    const second = ngMocks.get(node, SecondDirective);
    const firstValue = first.firstValue;
    const secondValue = second.secondValue;

    expect(isMockOf(first, FirstDirective)).toBe(false);
    expect(isMockOf(second, SecondDirective)).toBe(false);
    expect(firstValue()).toBe('initial');
    expect(secondValue()).toBe('transformed:initial');
    expect(template.elementRef.nativeElement).toBe(node.nativeNode);
    expect(transformations).toBe(1);

    for (const value of ['initial', 'transformed:initial']) {
      expect(ngMocks.reveal(fixture, ['shared', value])).toBe(node);
      expect(ngMocks.revealAll(fixture, ['shared', value])).toEqual([
        node,
      ]);
      expect(
        ngMocks.findTemplateRef(fixture, ['shared', value]).elementRef
          .nativeElement,
      ).toBe(template.elementRef.nativeElement);
      expect(
        ngMocks
          .findTemplateRefs(fixture, ['shared', value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }

    expect(
      ngMocks.reveal(fixture, ['shared', 'missing'], null),
    ).toBeNull();
    expect(ngMocks.revealAll(fixture, ['shared', 'missing'])).toEqual(
      [],
    );
    expect(
      ngMocks.findTemplateRef(fixture, ['shared', 'missing'], null),
    ).toBeNull();
    expect(
      ngMocks.findTemplateRefs(fixture, ['shared', 'missing']),
    ).toEqual([]);
    expect(
      ngMocks.reveal(fixture, ['shared', undefined], null),
    ).toBeNull();
    expect(ngMocks.revealAll(fixture, ['shared', undefined])).toEqual(
      [],
    );
    expect(
      ngMocks.findTemplateRef(fixture, ['shared', undefined], null),
    ).toBeNull();
    expect(
      ngMocks.findTemplateRefs(fixture, ['shared', undefined]),
    ).toEqual([]);
    expect(transformations).toBe(1);

    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();

    expect(first.firstValue).toBe(firstValue);
    expect(second.secondValue).toBe(secondValue);
    expect(firstValue()).toBe('updated');
    expect(secondValue()).toBe('transformed:updated');
    expect(transformations).toBe(2);

    for (const value of ['updated', 'transformed:updated']) {
      expect(ngMocks.reveal(fixture, ['shared', value])).toBe(node);
      expect(ngMocks.revealAll(fixture, ['shared', value])).toEqual([
        node,
      ]);
      expect(
        ngMocks.findTemplateRef(fixture, ['shared', value]).elementRef
          .nativeElement,
      ).toBe(template.elementRef.nativeElement);
      expect(
        ngMocks
          .findTemplateRefs(fixture, ['shared', value])
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }

    expect(ngMocks.revealAll(fixture, ['shared', 'initial'])).toEqual(
      [],
    );
    expect(
      ngMocks.findTemplateRefs(fixture, [
        'shared',
        'transformed:initial',
      ]),
    ).toEqual([]);
    expect(transformations).toBe(2);
  });
});
