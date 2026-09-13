import { ResourceLoader } from '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let constructions = 0;

@Component({
  selector: 'native-issue-15004',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'native',
})
class NativeComponent {
  public constructor() {
    constructions += 1;
  }
}

@Component({
  selector: 'target-issue-15004',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class TargetComponent {
  public constructor() {
    constructions += 1;
  }
}

@Component({
  selector: 'success-issue-15004',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'compiled successfully',
})
class SuccessComponent {}

@Component({
  selector: 'recovery-issue-15004',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'recovered',
})
class RecoveryComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15004
// Angular 9-16 Ivy TestBed has a separate resource queue; test.spec.ts covers those versions.
describe('issue-15004:resources', () => {
  beforeEach(() => {
    constructions = 0;
  });

  it('preserves the native asynchronous compilation rejection', async () => {
    const failure = new Error('issue-15004 native stylesheet');
    // Runtime URLs prevent Angular 5's resource transform from requiring a stylesheet file.
    const styleUrls = ['native-issue-15004.css'];
    const requests: string[] = [];
    TestBed.configureTestingModule({
      declarations: [NativeComponent],
    });
    // Queue resource metadata after configuration, before Angular starts compilation.
    Component({
      selector: 'native-issue-15004',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
      template: 'native',
      styleUrls,
    })(NativeComponent);
    TestBed.overrideComponent(NativeComponent, {
      set: { styleUrls },
    });
    TestBed.configureCompiler({
      providers: [
        {
          provide: ResourceLoader,
          useValue: {
            get: (url: string): Promise<string> => {
              requests.push(url);
              return Promise.reject(failure);
            },
          },
        },
      ],
    });

    const loggedErrors: Error[][] = [];
    const consoleError = console.error;
    ngMocks.stubMember(console, 'error', (...args: Error[]) =>
      loggedErrors.push(args),
    );
    let rejected = false;
    try {
      await TestBed.compileComponents();
    } catch (error) {
      rejected = true;
      expect(error === failure).toBe(true);
    } finally {
      ngMocks.stubMember(console, 'error', consoleError);
    }

    expect(rejected).toBe(true);
    expect(requests.length).toBe(1);
    expect(requests[0]).toContain('native-issue-15004.css');
    expect(constructions).toBe(0);
    for (const args of loggedErrors) {
      expect(args).toEqual([failure]);
    }
  });

  it('rejects the builder and allows a fresh compilation after resetting TestBed', async () => {
    const failure = new Error('issue-15004 builder stylesheet');
    const styleUrls = ['builder-issue-15004.css'];
    const requests: string[] = [];
    const builder = MockBuilder()
      .keep(TargetComponent)
      .beforeCompileComponents(testBed => {
        testBed.configureCompiler({
          providers: [
            {
              provide: ResourceLoader,
              useValue: {
                get: (url: string): Promise<string> => {
                  requests.push(url);
                  return Promise.reject(failure);
                },
              },
            },
          ],
        });
        // Applying the decorator queues the resource; the override updates TestBed metadata.
        Component({
          selector: 'target-issue-15004',
          ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
          template: 'target',
          styleUrls,
        })(TargetComponent);
        testBed.overrideComponent(TargetComponent, {
          set: { styleUrls },
        });
      });

    const loggedErrors: Error[][] = [];
    const consoleError = console.error;
    ngMocks.stubMember(console, 'error', (...args: Error[]) =>
      loggedErrors.push(args),
    );
    let rejected = false;
    try {
      // Angular's rejected compilation must settle the builder's outer promise too.
      await builder;
    } catch (error) {
      rejected = true;
      expect(error === failure).toBe(true);
    } finally {
      ngMocks.stubMember(console, 'error', consoleError);
    }

    expect(rejected).toBe(true);
    expect(requests.length).toBe(1);
    expect(requests[0]).toContain('builder-issue-15004.css');
    expect(constructions).toBe(0);
    for (const args of loggedErrors) {
      expect(args).toEqual([failure]);
    }

    TestBed.resetTestingModule();
    await MockBuilder().keep(RecoveryComponent);
    const fixture = MockRender(RecoveryComponent);
    expect(fixture.nativeElement.innerHTML).toContain('recovered');
  });

  it('configures synchronously and resolves after loading a resource', async () => {
    const events: string[] = [];
    const styleUrls = ['success-issue-15004.css'];
    const requests: string[] = [];
    let configuredTestBed: object | undefined;
    const builder = MockBuilder()
      .keep(SuccessComponent)
      .beforeCompileComponents(testBed => {
        configuredTestBed = testBed;
        events.push('hook');
        testBed.configureCompiler({
          providers: [
            {
              provide: ResourceLoader,
              useValue: {
                get: (url: string): Promise<string> => {
                  events.push('load');
                  requests.push(url);
                  return Promise.resolve(':host { display: block; }');
                },
              },
            },
          ],
        });
        Component({
          selector: 'success-issue-15004',
          ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
          template: 'compiled successfully',
          styleUrls,
        })(SuccessComponent);
        testBed.overrideComponent(SuccessComponent, {
          set: { styleUrls },
        });
      });

    const pending = builder.then();
    expect(events[0]).toBe('hook');
    const result = await pending;

    expect(result.testBed === configuredTestBed).toBe(true);
    expect(events).toEqual(['hook', 'load']);
    expect(requests.length).toBe(1);
    expect(requests[0]).toContain('success-issue-15004.css');
    const fixture = TestBed.createComponent(SuccessComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(
      'compiled successfully',
    );
  });
});
