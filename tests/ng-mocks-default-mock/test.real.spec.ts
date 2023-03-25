import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { MockRender, ngMocks } from 'ng-mocks';

import {
  TargetComponent,
  TargetDirective,
  TargetModule,
} from './fixtures';

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ng-mocks-default-mock:real', () => {
  beforeEach(async () => {
    return TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
  });

  it('renders correctly', () => {
    const fixture = MockRender(TargetComponent);

    // Renders proper html.
    expect(fixture.nativeElement.innerHTML).toContain(
      '<target-ng-mocks-default-mock>pipe:target</target-ng-mocks-default-mock>',
    );

    // Component has a subject.
    const component = fixture.point.componentInstance;
    const o2 = component.o2$;
    expect(o2).toEqual(assertion.any(Subject));
    expect(component.getO2()).toEqual(o2);

    // Directive has a subject.
    const directive = ngMocks.findInstance(
      fixture.point,
      TargetDirective,
    );
    const o3 = directive.o3$;
    expect(o3).toEqual(assertion.any(Subject));
    expect(directive.getO3()).toEqual(o3);

    // Pipe as a service is shared.
    const pipe = component.pipe;
    expect(pipe).toBe(directive.pipe);
    const o1 = pipe.o1$;
    expect(o1).toEqual(assertion.any(Subject));
    expect(pipe.getO1()).toEqual(o1);
    expect(pipe.transform('test', true)).toEqual('pipe:test');
    expect(pipe.transform('test', false)).toEqual('');

    // Service is shared.
    const service = component.service;
    expect(service).toBe(directive.service);
    expect(service.name).toEqual('TargetService');
    expect(service.echo('test:')).toEqual('test:TargetService');

    // Token is provided.
    expect(component.token).toEqual('token');
    expect(directive.token).toEqual('token');
    expect(pipe.token).toEqual('token');
  });
});
