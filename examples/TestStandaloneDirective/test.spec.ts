import {
  Directive,
  Injectable,
  Input,
  OnInit,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @TODO remove with A5 support
const injectableRootServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

// A root service we want to mock.
@Injectable(...injectableRootServiceArgs)
class RootService {
  trigger(name: string | null) {
    // does something very cool

    return name;
  }
}

// A standalone directive we are going to test.
@Directive({
  selector: 'standalone',
  standalone: true,
} as never)
class StandaloneDirective implements OnInit {
  @Input() public readonly name: string | null = null;

  constructor(public readonly rootService: RootService) {}

  ngOnInit(): void {
    this.rootService.trigger(this.name);
  }
}

describe('TestStandaloneDirective', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    return MockBuilder(StandaloneDirective);
  });

  it('renders dependencies', () => {
    // Rendering the directive.
    MockRender(StandaloneDirective, {
      name: 'test',
    });

    // Asserting that StandaloneDirective calls RootService.trigger.
    const rootService = ngMocks.findInstance(RootService);
    // it's possible because of autoSpy.
    expect(rootService.trigger).toHaveBeenCalledWith('test');
  });
});
