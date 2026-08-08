import { Injectable } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockBuilder, MockService, ngMocks } from 'ng-mocks';
import { vi } from 'vitest';

@Injectable()
class AutoSpyService {
  public echo(): string {
    return 'real';
  }
}

const topLevelMock = MockService(AutoSpyService);

// @see https://github.com/help-me-mom/ng-mocks/issues/7802
describe('issue-7802', () => {
  beforeEach(() => MockBuilder().mock(AutoSpyService));

  it('keeps auto spies active across test files', () => {
    const service = ngMocks.findInstance(AutoSpyService);
    const echo = vi.mocked(service.echo);

    expect(vi.isMockFunction(echo)).toBe(true);
    expect(echo.getMockName()).toBe(`${AutoSpyService.name}.echo`);

    echo.mockReturnValue('mocked');
    expect(service.echo()).toBe('mocked');
    expect(echo).toHaveBeenCalledOnce();
  });

  it('installs auto spies before importing a spec', () => {
    expect(vi.isMockFunction(topLevelMock.echo)).toBe(true);
  });

  it('preserves Angular fakeAsync support', fakeAsync(() => {
    let completed = false;
    setTimeout(() => {
      completed = true;
    });

    tick();

    expect(completed).toBe(true);
  }));
});
