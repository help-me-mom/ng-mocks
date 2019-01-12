import { async, TestBed } from '@angular/core/testing';
import { MockProvider } from './mock-provider';

// tslint:disable:max-classes-per-file
// tslint:disable:prefer-function-over-method
// tslint:disable:no-unbound-method
class SampleProvider {
  method1(): string {
    return 'test';
  }

  method2(): void {}
}

class SampleProvider2 {
  method1(): void {}
  method2(): void {}
}

class SampleProvider3 {
  method1(): string {
    return 'test';
  }
}

describe('MockProvider', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(SampleProvider),
        MockProvider(SampleProvider2, (methodName) => jasmine.createSpy(methodName)),
        MockProvider(SampleProvider3, (methodName) => () => methodName)
      ]
    }).compileComponents();
  }));

  it('should mock all methods', () => {
    const sampleProvider: SampleProvider = TestBed.get(SampleProvider);

    expect(sampleProvider.method1).toBeDefined();
    expect(sampleProvider.method2).toBeDefined();
  });

  it('should mock all methods with predefined function', () => {
    const sampleProvider2: SampleProvider2 = TestBed.get(SampleProvider2);

    expect(sampleProvider2.method1).toBeDefined();
    expect(sampleProvider2.method2).toBeDefined();

    sampleProvider2.method1();
    sampleProvider2.method2();

    expect(sampleProvider2.method1).toHaveBeenCalledTimes(1);
    expect(sampleProvider2.method2).toHaveBeenCalledTimes(1);
  });

  it('should tell the name of mocked function', () => {
    const sampleProvider3: SampleProvider3 = TestBed.get(SampleProvider3);

    const name = sampleProvider3.method1();
    expect(name).toBe('method1');
  });
});
