import crawlByDeclaration from './crawl-by-declaration';

describe('crawl-by-declaration', () => {
  it('returns false on exceptions', () => {
    const declaration: any = {};
    const callback = crawlByDeclaration(declaration);

    const node: any = {
      injector: {
        get: () => {
          throw new Error();
        },
      },
      providerTokens: [declaration],
    };
    expect(callback(node)).toEqual(false);
  });
});
