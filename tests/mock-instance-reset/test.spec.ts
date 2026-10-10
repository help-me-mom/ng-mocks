const triggers: string[] = [];

describe('mock-instance-reset', () => {
  describe('test', () => {
    beforeAll(() => triggers.push('beforeAll:1'));
    afterAll(() => triggers.push('afterAll:1'));

    beforeAll(() => triggers.push('beforeAll:2'));
    afterAll(() => triggers.push('afterAll:2'));

    beforeEach(() => triggers.push('beforeEach:1'));
    beforeEach(() => triggers.push('beforeEach:2'));

    afterEach(() => triggers.push('afterEach:1'));
    afterEach(() => triggers.push('afterEach:2'));

    it('triggers test #1', () => {
      expect(1).toEqual(1);
    });

    it('triggers test #2', () => {
      expect(2).toEqual(2);
    });

    describe('nested', () => {
      beforeAll(() => triggers.push('beforeAll:3'));
      afterAll(() => triggers.push('afterAll:3'));

      beforeEach(() => triggers.push('beforeEach:3'));
      afterEach(() => triggers.push('afterEach:3'));

      it('triggers test #3', () => {
        expect(3).toEqual(3);
      });
    });
  });

  it('has expected order', () => {
    // first before is called the first
    // first after is called the last
    expect(triggers).toEqual([
      'beforeAll:1',
      'beforeAll:2',

      'beforeEach:1',
      'beforeEach:2',
      'afterEach:2',
      'afterEach:1',

      'beforeEach:1',
      'beforeEach:2',
      'afterEach:2',
      'afterEach:1',

      'beforeAll:3',
      'beforeEach:1',
      'beforeEach:2',
      'beforeEach:3',
      'afterEach:3',
      'afterEach:2',
      'afterEach:1',
      'afterAll:3',

      'afterAll:2',
      'afterAll:1',
    ]);
  });
});
