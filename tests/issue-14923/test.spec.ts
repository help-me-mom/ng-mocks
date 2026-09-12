import { Directive, Input } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[left]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class LeftDirective {
  @Input('region') public leftValue = '';
  @Input() public plain = '';
}

@Directive({
  selector: '[right]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class RightDirective {
  @Input('region') public rightValue = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14923
describe('issue-14923', () => {
  for (const reverse of [false, true]) {
    describe(reverse ? 'right first' : 'left first', () => {
      beforeEach(() =>
        reverse
          ? MockBuilder().keep(RightDirective).keep(LeftDirective)
          : MockBuilder().keep(LeftDirective).keep(RightDirective),
      );

      for (const dynamic of [false, true]) {
        it(`finds each directive value on a ${dynamic ? 'dynamic' : 'static'} template binding`, () => {
          const fixture = MockRender(
            dynamic
              ? '<ng-template #target left right [region]="value" plain="plain"></ng-template>'
              : '<ng-template #target left right region="shared" plain="plain"></ng-template>',
            { value: 'shared' },
          );
          const node = ngMocks.reveal(LeftDirective);
          const left = node.injector.get(LeftDirective);
          const right = node.injector.get(RightDirective);
          const template = ngMocks.findTemplateRef('target');

          expect(isMockOf(left, LeftDirective)).toBe(false);
          expect(isMockOf(right, RightDirective)).toBe(false);
          expect(
            node.providerTokens.filter(
              token =>
                token === LeftDirective || token === RightDirective,
            ),
          ).toEqual(
            reverse
              ? [RightDirective, LeftDirective]
              : [LeftDirective, RightDirective],
          );
          expect(left.leftValue).toBe('shared');
          expect(right.rightValue).toBe('shared');
          expect(ngMocks.revealAll(['region', 'shared'])).toEqual([
            node,
          ]);
          expect(
            ngMocks.findTemplateRefs(['region', 'shared']).length,
          ).toBe(1);
          expect(ngMocks.reveal(['plain', 'plain'])).toBe(node);

          // Each directive must be inspected even when an earlier provider has the same alias.
          left.leftValue = 'left';
          right.rightValue = 'right';

          expect(ngMocks.input(node, 'region')).toBe(
            reverse ? 'right' : 'left',
          );
          for (const value of ['left', 'right']) {
            expect(ngMocks.reveal(['region', value], null)).toBe(
              node,
            );
            expect(ngMocks.revealAll(['region', value])).toEqual([
              node,
            ]);
            const found = ngMocks.findTemplateRef(
              ['region', value],
              null,
            );
            expect(found && found.elementRef.nativeElement).toBe(
              template.elementRef.nativeElement,
            );
            expect(
              ngMocks
                .findTemplateRefs(['region', value])
                .map(ref => ref.elementRef.nativeElement),
            ).toEqual([template.elementRef.nativeElement]);
          }
          expect(
            ngMocks.reveal(['region', 'missing'], null),
          ).toBeNull();
          expect(ngMocks.revealAll(['region', 'missing'])).toEqual(
            [],
          );
          expect(
            ngMocks.findTemplateRef(['region', 'missing'], null),
          ).toBeNull();
          expect(
            ngMocks.findTemplateRefs(['region', 'missing']),
          ).toEqual([]);
          expect(
            ngMocks.reveal(['region', undefined], null),
          ).toBeNull();
          expect(ngMocks.revealAll(['region', undefined])).toEqual(
            [],
          );
          expect(
            ngMocks.findTemplateRef(['region', undefined], null),
          ).toBeNull();
          expect(
            ngMocks.findTemplateRefs(['region', undefined]),
          ).toEqual([]);

          if (dynamic) {
            fixture.componentInstance.value = 'updated';
            fixture.detectChanges();

            expect(left.leftValue).toBe('updated');
            expect(right.rightValue).toBe('updated');
            expect(ngMocks.revealAll(['region', 'updated'])).toEqual([
              node,
            ]);
            expect(
              ngMocks.findTemplateRefs(['region', 'updated']).length,
            ).toBe(1);
            expect(ngMocks.revealAll(['region', 'left'])).toEqual([]);
            expect(
              ngMocks.findTemplateRefs(['region', 'right']),
            ).toEqual([]);
          }
        });
      }

      it('finds each directive value on a container without returning duplicates', () => {
        MockRender(
          '<ng-container left right region="shared"><span>content</span></ng-container>',
        );
        const node = ngMocks.reveal(LeftDirective);
        const left = node.injector.get(LeftDirective);
        const right = node.injector.get(RightDirective);

        expect(isMockOf(left, LeftDirective)).toBe(false);
        expect(isMockOf(right, RightDirective)).toBe(false);
        expect(ngMocks.revealAll(['region', 'shared'])).toEqual([
          node,
        ]);
        expect(ngMocks.formatHtml(node)).toBe('<span>content</span>');

        left.leftValue = 'left';
        right.rightValue = 'right';

        expect(ngMocks.reveal(['region', 'left'], null)).toBe(node);
        expect(ngMocks.revealAll(['region', 'left'])).toEqual([node]);
        expect(ngMocks.reveal(['region', 'right'], null)).toBe(node);
        expect(ngMocks.revealAll(['region', 'right'])).toEqual([
          node,
        ]);
        expect(
          ngMocks.reveal(['region', 'missing'], null),
        ).toBeNull();
        expect(ngMocks.revealAll(['region', 'missing'])).toEqual([]);
        expect(
          ngMocks.reveal(['region', undefined], null),
        ).toBeNull();
        expect(ngMocks.revealAll(['region', undefined])).toEqual([]);
      });
    });
  }
});
