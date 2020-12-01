import { TestBed } from '@angular/core/testing';
import { MockRender, ngMocks } from 'ng-mocks';
import { Subject } from 'rxjs';

import {
  TargetComponent,
  TargetDirective,
  TargetModule,
} from './fixtures';

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
      '<target>pipe:target</target>',
    );

    // Component has a subject.
    const component = fixture.point.componentInstance;
    const o2 = component.o2$;
    expect(o2).toEqual(jasmine.any(Subject));
    expect(component.getO2()).toEqual(o2);

    // Directive has a subject.
    const directive = ngMocks.findInstance(
      fixture.point,
      TargetDirective,
    );
    const o3 = directive.o3$;
    expect(o3).toEqual(jasmine.any(Subject));
    expect(directive.getO3()).toEqual(o3);

    // Pipe as a service is shared.
    const pipe = component.pipe;
    expect(pipe).toBe(directive.pipe);
    const o1 = pipe.o1$;
    expect(o1).toEqual(jasmine.any(Subject));
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
