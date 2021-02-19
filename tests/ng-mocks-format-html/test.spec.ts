import { ngMocks } from 'ng-mocks';

describe('ng-mocks-format-html', () => {
  it('handles undefined', () => {
    expect(ngMocks.formatHtml(undefined as any)).toEqual('');
  });

  it('handles unknown', () => {
    expect(ngMocks.formatHtml({} as any)).toEqual('');
  });

  it('handles text nodes', () => {
    // inner
    expect(
      ngMocks.formatHtml({
        nodeName: '#text',
        wholeText: ' test ',
      } as any),
    ).toEqual('test');

    // outer
    expect(
      ngMocks.formatHtml(
        {
          nodeName: '#text',
          wholeText: ' test ',
        } as any,
        true,
      ),
    ).toEqual(' test ');
  });
});
