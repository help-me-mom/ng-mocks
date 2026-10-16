import { Directive } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

describe('ng-mocks-reveal:traversal', () => {
  beforeEach(() => MockBuilder(TargetDirective));

  it('stops before inspecting later matches', () => {
    const fixture = MockRender(`
      <ng-container #match></ng-container>
      <ng-container #later></ng-container>
    `);
    const first = ngMocks.reveal(fixture, '#match');
    const later = ngMocks.reveal(fixture, '#later');
    let reads = 0;
    ngMocks.stubMember(
      later,
      'references',
      () => {
        reads += 1;

        return { match: true };
      },
      'get',
    );

    expect(ngMocks.reveal(fixture, '#match')).toBe(first);
    expect(reads).toBe(0);
  });

  it('collects nested matches in order while excluding the context node', () => {
    const fixture = MockRender(`
      <ng-container target>
        text
        <ng-container target></ng-container>
        <!-- comment -->
        <ng-template target></ng-template>
      </ng-container>
      <ng-container target></ng-container>
    `);
    const matches = ngMocks.revealAll(fixture, TargetDirective);

    expect(matches.length).toBe(4);
    expect(matches.map(node => node.nativeNode.nodeName)).toEqual([
      '#comment',
      '#comment',
      '#comment',
      '#comment',
    ]);
    expect(ngMocks.reveal(matches[0], TargetDirective)).toBe(
      matches[1],
    );
    expect(ngMocks.revealAll(matches[0], TargetDirective)).toEqual(
      matches.slice(1, 3),
    );
    expect(ngMocks.revealAll(matches[3], TargetDirective)).toEqual(
      [],
    );
  });

  it('preserves explicit defaults and errors when no descendant matches', () => {
    const fixture = MockRender(
      '<ng-container #match></ng-container>',
    );
    const root = ngMocks.reveal(fixture, '#match');
    const fallback = {};

    expect(ngMocks.reveal(root, '#match', fallback)).toBe(fallback);
    expect(ngMocks.reveal(root, '#match', undefined)).toBeUndefined();
    let message = '';
    try {
      ngMocks.reveal(root, '#match');
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe(
      'Cannot find a DebugElement via ngMocks.reveal(#match)',
    );
    expect(ngMocks.revealAll(root, '#match')).toEqual([]);
  });
});
