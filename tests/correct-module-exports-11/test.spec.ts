// tslint:disable:no-console

import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'internal',
  template: 'internal',
})
class InternalComponent {}

@Component({
  selector: 'external',
  template: 'external',
})
class ExternalComponent {}

@NgModule({
  declarations: [InternalComponent, ExternalComponent],
  exports: [ExternalComponent],
})
class TargetModule {}

describe('correct-module-exports-11:proper', () => {
  // Thanks Ivy, it doesn't throw an error.
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    console.error = console.warn = (...args: any[]) => {
      throw new Error(args.join(' '));
    };
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MockModule(TargetModule)],
    }).compileComponents(),
  );

  it('fails on not exported module', () => {
    expect(() => MockRender(InternalComponent)).toThrowError(/'internal' is not a known element/);
  });

  it('renders an exported module', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual('<external></external>');
  });
});

describe('correct-module-exports-11:guts', () => {
  beforeEach(() => TestBed.configureTestingModule(ngMocks.guts(null, TargetModule)).compileComponents());

  it('renders an internal module', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual('<internal></internal>');
  });
});

describe('correct-module-exports-11:builder', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  it('renders an internal module', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.nativeElement.innerHTML).toEqual('<internal></internal>');
  });
});
