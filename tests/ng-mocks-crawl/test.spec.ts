import { MockRender, ngMocks } from 'ng-mocks';

describe('ng-mocks-crawl', () => {
  it('finds all elements including ng-container', () => {
    const fixture = MockRender(
      `
      te&amp;st&gt;1
      <div>&gt;1&lt;</div>
      te&lt;st2
      <div>2</div>
      <ng-container>
        <div>3</div>
        <div>4</div>
        <ng-container>
          <div>5</div>
          <div>6</div>
        </ng-container>
        <div>7</div>
        <div>8</div>
      </ng-container>
      <div>9</div>
      <div>10</div>
      <ng-container>
        <div>11</div>
        <div>12</div>
      </ng-container>
    `.replace(new RegExp('s+', 'gm'), ''),
    );

    // in total, we have 30 nodes
    {
      const elements: any[] = [];
      ngMocks.crawl(fixture.debugElement, node => {
        elements.push(node);
      });
      expect(elements.length).toEqual(16);

      const expectedParent = elements[6];
      const child = elements[7];
      expect(ngMocks.formatHtml(expectedParent)).toEqual(
        '<div>5</div><div>6</div>',
      );
      expect(ngMocks.formatHtml(child)).toEqual('5');

      // The parent element should be ng-container
      let actualParent: any;
      ngMocks.crawl(child, (_, parent) => {
        actualParent = parent;

        return true;
      });
      expect(actualParent).toBe(expectedParent);
    }

    // checking direct children
    {
      const elements: any[] = [];
      ngMocks.crawl(fixture.debugElement, (node, parent) => {
        if (parent === fixture.debugElement) {
          elements.push(node);
        }
      });
      expect(elements.length).toEqual(6);
      expect(ngMocks.formatHtml(elements[0], true)).toEqual(
        '<div>&gt;1&lt;</div>',
      );
      expect(ngMocks.formatHtml(elements[1], true)).toEqual(
        '<div>2</div>',
      );
      expect(ngMocks.formatHtml(elements[2], true)).toEqual(
        '<div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>',
      );
      expect(ngMocks.formatHtml(elements[3], true)).toEqual(
        '<div>9</div>',
      );
      expect(ngMocks.formatHtml(elements[4], true)).toEqual(
        '<div>10</div>',
      );
      expect(ngMocks.formatHtml(elements[5], true)).toEqual(
        '<div>11</div><div>12</div>',
      );

      const children: any[] = [];
      ngMocks.crawl(elements[2], (node, parent) => {
        if (parent === elements[2]) {
          children.push(node);
        }
      });
      expect(children.length).toEqual(5);
      expect(ngMocks.formatHtml(children[0], true)).toEqual(
        '<div>3</div>',
      );
      expect(ngMocks.formatHtml(children[1], true)).toEqual(
        '<div>4</div>',
      );
      expect(ngMocks.formatHtml(children[2], true)).toEqual(
        '<div>5</div><div>6</div>',
      );
      expect(ngMocks.formatHtml(children[3], true)).toEqual(
        '<div>7</div>',
      );
      expect(ngMocks.formatHtml(children[4], true)).toEqual(
        '<div>8</div>',
      );
    }
  });

  it('skips text nodes', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const spy = jest.fn();
    const node: any = {
      injector: {},
      nativeNode: {
        nodeName: '#text',
        wholeText: ' ',
      },
    };

    ngMocks.crawl(node, spy);
    expect(spy).not.toHaveBeenCalled();

    ngMocks.crawl(node, spy, true);
    expect(spy).toHaveBeenCalledWith(node, undefined);
  });

  it('handles missing fixture', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    ngMocks.crawl('div', spy);
    ngMocks.crawl(['attr'], spy);
    expect(spy).not.toHaveBeenCalled();
  });
});
