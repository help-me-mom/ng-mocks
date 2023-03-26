import {
  Component,
  Directive,
  Injectable,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class HelloService {
  public description = 'real service';
}

@Component({
  providers: [HelloService],
  template: '',
})
class HelloComponent {
  public serviceDescription = '';

  public constructor(private readonly helloService: HelloService) {
    this.serviceDescription = this.helloService.description;
  }
}

@Directive({
  providers: [HelloService],
  selector: 'hello',
})
class HelloDirective {
  @Input() public name = '';
  public serviceDescription = '';

  public constructor(private readonly helloService: HelloService) {
    this.serviceDescription = this.helloService.description;
  }
}

// Components without selectors should still inherit mocked providers.
// https://github.com/help-me-mom/ng-mocks/issues/1876
describe('issue-1876', () => {
  beforeEach(() =>
    MockBuilder([HelloComponent, HelloDirective]).mock(HelloService, {
      description: 'fake service',
    }),
  );

  it('uses fake service in components', () => {
    MockRender(HelloComponent);
    const instance = ngMocks.findInstance(HelloComponent);
    expect(instance.serviceDescription).toContain('fake service');
  });

  it('uses fake service in directives', () => {
    MockRender(HelloDirective);
    const instance = ngMocks.findInstance(HelloDirective);
    expect(instance.serviceDescription).toContain('fake service');
  });
});
