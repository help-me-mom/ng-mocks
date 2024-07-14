import { MockRender, ngMocks } from 'ng-mocks';

describe('ng-mocks-format-text', () => {
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
      const expected = '< b1 b2 > d1 d2 &';
      expect(ngMocks.formatText(fixture)).toEqual(expected);
      expect(ngMocks.formatText(fixture, true)).toEqual(expected);
      expect(ngMocks.formatText(fixture.debugElement)).toEqual(
        expected,
      );
      expect(ngMocks.formatText(fixture.nativeElement)).toEqual(
        expected,
      );
    }

    // direct
    {
      expect(
        ngMocks
          .formatText(fixture.debugElement.childNodes)
          .filter(v => v.trim()),
      ).toEqual(['<', 'b1', 'b2', '>', 'd1 d2', '&']);
      expect(
        ngMocks
          .formatText(fixture.debugElement.childNodes, true)
          .filter(v => v.trim()),
      ).toEqual([' < ', 'b1', 'b2', ' > ', 'd1 d2', ' & ']);
    }

    // arrays
    {
      expect(
        ngMocks
          .formatText(ngMocks.findAll('div'))
          .filter(v => v.trim()),
      ).toEqual(['b1', 'b2', 'd1 d2']);
    }

    // nested arrays as strings
    {
      expect(
        ngMocks.formatText([ngMocks.findAll('div') as never]),
      ).toEqual(['b1b2d1 d2']);
    }
  });

  it('handles null as an empty string', () => {
    expect(ngMocks.formatText(null as never)).toEqual('');
  });

  it('handles broken html nodes as an empty string', () => {
    expect(
      ngMocks.formatText({
        nativeNode: {
          innerHTML: 'fake',
          nodeName: 'DIV',
        },
      }),
    ).toEqual('');
  });
});
