import { MockRender, ngMocks } from 'ng-mocks';

describe('ng-mocks-format-html', () => {
  it('formats nodes', () => {
    const fixture = MockRender(`
      <ng-container><!-- --> &lt; <!-- --></ng-container>
      <div>b1</div>
      <!-- -->
      <div> b2 <!-- 1 --> </div>
      &gt; <!-- 2 -->
      <div>
        <span><!-- -->  d1 <!-- --> </span> <!-- 3 -->
        <span><!-- -->  d2 <!-- --> </span>
      </div>
      &amp;
    `);

    // single
    {
      const expected =
        '&lt; <div>b1</div><div> b2 </div> &gt; <div><span> d1 </span><span> d2 </span></div> &amp;';
      expect(ngMocks.formatHtml(fixture)).toEqual(expected);
      expect(ngMocks.formatHtml(fixture.debugElement)).toEqual(
        expected,
      );
      expect(ngMocks.formatHtml(fixture.nativeElement)).toEqual(
        expected,
      );
    }

    // direct
    {
      expect(
        ngMocks
          .formatHtml(fixture.debugElement.childNodes)
          .filter(v => v.trim()),
      ).toEqual([
        '&lt;',
        'b1',
        'b2',
        '&gt;',
        '<span> d1 </span><span> d2 </span>',
        '&amp;',
      ]);
      expect(
        ngMocks
          .formatHtml(fixture.debugElement.childNodes, true)
          .filter(v => v.trim()),
      ).toEqual([
        ' &lt; ',
        '<div>b1</div>',
        '<div> b2 </div>',
        ' &gt; ',
        '<div><span> d1 </span><span> d2 </span></div>',
        ' &amp; ',
      ]);
    }

    // arrays
    {
      expect(
        ngMocks
          .formatHtml(ngMocks.findAll('div'), true)
          .filter(v => v.trim()),
      ).toEqual([
        '<div>b1</div>',
        '<div> b2 </div>',
        '<div><span> d1 </span><span> d2 </span></div>',
      ]);
    }

    // nested arrays as strings
    {
      expect(
        ngMocks.formatHtml([ngMocks.findAll('div') as any]),
      ).toEqual([
        '<div>b1</div><div> b2 </div><div><span> d1 </span><span> d2 </span></div>',
      ]);
    }
  });

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
      } as never),
    ).toEqual('test');

    // outer
    expect(
      ngMocks.formatHtml(
        {
          nodeName: '#text',
          wholeText: ' test ',
        } as never,
        true,
      ),
    ).toEqual(' test ');
  });
});
