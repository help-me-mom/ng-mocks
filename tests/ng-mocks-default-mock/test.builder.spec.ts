import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  EMPTY,
  NEVER,
  TargetComponent,
  TargetDirective,
  TargetModule,
  TargetPipe,
  TargetService,
  TOKEN,
} from './fixtures';

describe('ng-mocks-default-mock:builder:no-overrides', () => {
  beforeEach(() => {
    return MockBuilder(null, TargetModule);
  });

  it('renders correctly', () => {
    const fixture = MockRender(TargetComponent);

    // Renders an empty template.
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target-ng-mocks-default-mock></target-ng-mocks-default-mock>',
    );

    // Component has a subject.
    const component = fixture.point.componentInstance;
    const o2 = component.o2$;
    expect(o2).toBe(EMPTY);
    expect(component.getO2()).toEqual(o2);
    expect(component.destroy$).toBeUndefined();
    expect(() => component.ngOnDestroy()).not.toThrow();

    // Directive has a subject.
    const directive = ngMocks.findInstance(
      fixture.point,
      TargetDirective,
    );
    const o3 = directive.o3$;
    expect(o3).toBe(EMPTY);
    expect(directive.getO3()).toEqual(o3);
    expect(directive.destroy$).toBeUndefined();
    expect(() => directive.ngOnDestroy()).not.toThrow();

    // Pipe as a service is shared.
    const pipe = component.pipe;
    expect(pipe).toBe(directive.pipe);
    const o1 = pipe.o1$;
    expect(o1).toBe(EMPTY);
    expect(pipe.getO1()).toEqual(o1);
    expect(pipe.transform('test', true)).toEqual('["test",true]');
    expect(pipe.transform('test', false)).toEqual('["test",false]');

    // Service is shared.
    const service = component.service;
    expect(service).toBe(directive.service);
    expect(service.name).toEqual('mockName');
    expect(service.echo('test:')).toEqual('mockEcho');

    // Token is provided.
    expect(component.token).toEqual('mockToken');
    expect(directive.token).toEqual('mockToken');
    expect(pipe.token).toEqual('mockToken');
  });
});

describe('ng-mocks-default-mock:builder:overrides', () => {
  beforeEach(() => {
    return MockBuilder(null, TargetModule)
      .mock(TOKEN, 'overrideToken')
      .mock(TargetPipe, {
        getO1: () => NEVER,
        o1$: NEVER,
        transform: (...args: any[]) =>
          JSON.stringify(args).length.toString(),
      })
      .mock(TargetService, {
        echo: () => 'overrideEcho',
        name: 'overrideName' as any,
      });
  });

  it('renders correctly', () => {
    const fixture = MockRender(TargetComponent);

    // Renders an empty template.
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target-ng-mocks-default-mock></target-ng-mocks-default-mock>',
    );

    // Component has a subject.
    const component = fixture.point.componentInstance;
    const o2 = component.o2$;
    expect(o2).toBe(EMPTY);
    expect(component.getO2()).toEqual(o2);
    expect(component.destroy$).toBeUndefined();
    expect(() => component.ngOnDestroy()).not.toThrow();

    // Directive has a subject.
    const directive = ngMocks.findInstance(
      fixture.point,
      TargetDirective,
    );
    const o3 = directive.o3$;
    expect(o3).toBe(EMPTY);
    expect(directive.getO3()).toEqual(o3);
    expect(directive.destroy$).toBeUndefined();
    expect(() => directive.ngOnDestroy()).not.toThrow();

    // Pipe as a service is shared.
    const pipe = component.pipe;
    expect(pipe).toBe(directive.pipe);
    const o1 = pipe.o1$;
    expect(o1).toBe(NEVER);
    expect(pipe.getO1()).toEqual(o1);
    expect(pipe.transform('test', true)).toEqual('13');
    expect(pipe.transform('test', false)).toEqual('14');

    // Service is shared.
    const service = component.service;
    expect(service).toBe(directive.service);
    expect(service.name).toEqual('overrideName');
    expect(service.echo('test:')).toEqual('overrideEcho');

    // Token is provided.
    expect(component.token).toEqual('overrideToken');
    expect(directive.token).toEqual('overrideToken');
    expect(pipe.token).toEqual('overrideToken');
  });
});
