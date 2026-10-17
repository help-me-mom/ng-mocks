import {
  Component,
  Injectable,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, MockPipe, ngMocks } from 'ng-mocks';

// A pipe which is also an injectable service, like TranslatePipe of @ngx-translate/core.
@Injectable()
@Pipe({
  name: 'translate',
  standalone: true,
})
class TranslatePipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

@Component({
  selector: 'real',
  standalone: true,
  imports: [TranslatePipe],
  template: `{{ 'real' | translate }}`,
})
class RealComponent {}

@Component({
  selector: 'first',
  standalone: true,
  imports: [TranslatePipe],
  template: '',
})
class FirstComponent {}

@Component({
  selector: 'second',
  standalone: true,
  imports: [TranslatePipe],
  template: '',
})
class SecondComponent {}

// TestBed with real and mock declarations uses a hidden MockBuilder, which provides NG_MOCKS.
// There, the injectable pipe is mapped to a provider object, which must not become an import of a mock.
// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340', () => {
  beforeAll(() => ngMocks.reset());
  afterAll(() => ngMocks.reset());

  it('mocks a standalone import with the mock pipe while a fixture is active', () => {
    // caches the mock pipe
    MockComponent(FirstComponent);

    TestBed.configureTestingModule({
      imports: [RealComponent, MockPipe(TranslatePipe)],
    });
    TestBed.createComponent(RealComponent);

    // resolves the cached mock pipe while the fixture above is still active
    const mock = MockComponent(SecondComponent);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [mock],
    });
    expect(() => TestBed.createComponent(mock)).not.toThrow();
  });
});
