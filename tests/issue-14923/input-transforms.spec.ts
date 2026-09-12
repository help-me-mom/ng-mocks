import { Directive, Input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[firstTransform14923]',
  standalone: true,
})
class FirstDirective {
  @Input({ alias: 'shared', transform: Number })
  public firstValue = 0;
}

@Directive({
  selector: '[secondTransform14923]',
  standalone: true,
})
class SecondDirective {
  @Input({
    alias: 'shared',
    transform: (value: string) => Number(value) * 2,
  })
  public secondValue = 0;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14923
// A shared public alias must read the stored value from each directive.
describe('issue-14923:input-transforms', () => {
  for (const reverse of [false, true]) {
    describe(
      reverse ? 'second directive first' : 'first directive first',
      () => {
        beforeEach(() =>
          MockBuilder(
            reverse
              ? [SecondDirective, FirstDirective]
              : [FirstDirective, SecondDirective],
          ),
        );

        it('finds both transformed values and returns a shared match once after an update', () => {
          const fixture = MockRender(
            '<ng-template #target firstTransform14923 secondTransform14923 [shared]="value"></ng-template>',
            { value: '2' },
          );
          const node = ngMocks.reveal(fixture, FirstDirective);
          const template = ngMocks.findTemplateRef(fixture, 'target');
          const first = ngMocks.get(node, FirstDirective);
          const second = ngMocks.get(node, SecondDirective);

          expect(isMockOf(first, FirstDirective)).toBe(false);
          expect(isMockOf(second, SecondDirective)).toBe(false);
          expect(first.firstValue).toBe(2);
          expect(second.secondValue).toBe(4);
          expect(template.elementRef.nativeElement).toBe(
            node.nativeNode,
          );

          for (const value of [2, 4]) {
            expect(ngMocks.reveal(fixture, ['shared', value])).toBe(
              node,
            );
            expect(
              ngMocks.revealAll(fixture, ['shared', value]),
            ).toEqual([node]);
            expect(
              ngMocks.findTemplateRef(fixture, ['shared', value])
                .elementRef.nativeElement,
            ).toBe(template.elementRef.nativeElement);
            expect(
              ngMocks
                .findTemplateRefs(fixture, ['shared', value])
                .map(result => result.elementRef.nativeElement),
            ).toEqual([template.elementRef.nativeElement]);
          }

          expect(
            ngMocks.reveal(fixture, ['shared', '2'], null),
          ).toBeNull();
          expect(ngMocks.revealAll(fixture, ['shared', '2'])).toEqual(
            [],
          );
          expect(
            ngMocks.findTemplateRef(fixture, ['shared', '2'], null),
          ).toBeNull();
          expect(
            ngMocks.findTemplateRefs(fixture, ['shared', '2']),
          ).toEqual([]);
          expect(
            ngMocks.reveal(fixture, ['shared', undefined], null),
          ).toBeNull();
          expect(
            ngMocks.revealAll(fixture, ['shared', undefined]),
          ).toEqual([]);
          expect(
            ngMocks.findTemplateRef(
              fixture,
              ['shared', undefined],
              null,
            ),
          ).toBeNull();
          expect(
            ngMocks.findTemplateRefs(fixture, ['shared', undefined]),
          ).toEqual([]);

          fixture.componentInstance.value = '0';
          fixture.detectChanges();

          expect(first.firstValue).toBe(0);
          expect(second.secondValue).toBe(0);
          expect(ngMocks.reveal(fixture, ['shared', 0])).toBe(node);
          expect(ngMocks.revealAll(fixture, ['shared', 0])).toEqual([
            node,
          ]);
          expect(
            ngMocks.findTemplateRef(fixture, ['shared', 0]).elementRef
              .nativeElement,
          ).toBe(template.elementRef.nativeElement);
          expect(
            ngMocks
              .findTemplateRefs(fixture, ['shared', 0])
              .map(result => result.elementRef.nativeElement),
          ).toEqual([template.elementRef.nativeElement]);
          expect(ngMocks.revealAll(fixture, ['shared', 2])).toEqual(
            [],
          );
          expect(
            ngMocks.findTemplateRefs(fixture, ['shared', 4]),
          ).toEqual([]);
        });
      },
    );
  }
});
