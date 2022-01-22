import { MockRender, ngMocks } from 'ng-mocks';

import mockHelperGet from './mock-helper.get';

describe('mock-helper.get', () => {
  class Proto {}

  it('searches in ViewEngine comments of structural directives', () => {
    const proto = new Proto();
    MockRender('<span></span><div></div>');
    const span = ngMocks.find('span');
    const div = ngMocks.find('div');

    // creating a comment like in the old View Engine
    // tslint:disable-next-line no-inner-html
    span.nativeElement.innerHTML = '<!-- comment -->';
    const comment = span.childNodes[0];
    div.nativeNode.parentNode.insertBefore(
      comment.nativeNode,
      div.nativeNode,
    );

    // we need to make it static
    if (div.parent) {
      ngMocks.stubMember(div, 'parent', div.parent);
      ngMocks.stubMember(
        div.parent,
        'queryAllNodes',
        (filter: (item: any) => boolean) =>
          [
            {
              _debugContext: {
                view: {
                  nodes: [
                    {
                      instance: proto,
                    },
                  ],
                },
              },
              nativeNode: comment.nativeNode,
            } as any,
          ].filter(filter),
      );
    }

    const actual = mockHelperGet('div', Proto);
    expect(actual).toBe(proto);
  });
});
