let globalVar = 0;

const backupTest = (newValue: typeof globalVar): void => {
  let backup: typeof globalVar;

  beforeEach(() => {
    backup = globalVar;
    globalVar = newValue;
  });

  afterEach(() => {
    globalVar = backup;
  });
};

describe('mock-instance-reset:backup', () => {
  it('equals 0 before all', () => {
    expect(globalVar).toEqual(0);
  });

  describe('globalVar', () => {
    backupTest(1);
    backupTest(2);

    it('equals 2 before each', () => {
      expect(globalVar).toEqual(2);
    });

    describe('each', () => {
      backupTest(3);
      backupTest(4);

      it('equals 4 after each', () => {
        expect(globalVar).toEqual(4);
      });
    });

    it('resets to 2 after each', () => {
      expect(globalVar).toEqual(2);
    });
  });

  it('resets to 0 after all', () => {
    expect(globalVar).toEqual(0);
  });
});
