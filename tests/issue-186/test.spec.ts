import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';

@Injectable()
class ExampleProvider {
  a: number;
}
@NgModule({
  providers: [ExampleProvider],
})
class ExampleModule {}

describe('issue-186:real', () => {
  let exampleProvider: ExampleProvider;
  let exampleProviderFromSetupPhase: ExampleProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExampleModule],
    });

    exampleProvider = TestBed.get(ExampleProvider);
  });

  it('should not be able to pass state between tests (setup phase)', () => {
    exampleProviderFromSetupPhase = exampleProvider;
    expect(exampleProvider.a).toBeUndefined();
    exampleProvider.a = 11;
  });

  it('should not be able to pass state between tests (validation phase)', () => {
    expect(exampleProvider).not.toBe(exampleProviderFromSetupPhase);
    expect(exampleProvider.a).toBeUndefined();
  });
});

describe('issue-186:mock', () => {
  let exampleProvider: ExampleProvider;
  let exampleProviderFromSetupPhase: ExampleProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockModule(ExampleModule)],
    });

    exampleProvider = TestBed.get(ExampleProvider);
  });

  it('should not be able to pass state between tests (setup phase)', () => {
    exampleProviderFromSetupPhase = exampleProvider;
    expect(exampleProvider.a).toBeUndefined();
    exampleProvider.a = 11;
  });

  it('should not be able to pass state between tests (validation phase)', () => {
    expect(exampleProvider).not.toBe(exampleProviderFromSetupPhase);
    expect(exampleProvider.a).toBeUndefined();
  });
});
