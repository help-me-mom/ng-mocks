import {
  Component,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple standalone pipe we are going to mock.
@Pipe({
  name: 'standalone',
  standalone: true,
} as never)
class StandalonePipe implements PipeTransform {
  transform(value: string | null): string {
    return `${value}:${this.constructor.name}`;
  }
}

// A simple dependency component we are going to mock.
@Component({
  selector: 'dependency-standalone-component',
  template: '<ng-content></ng-content>',
})
class DependencyComponent {
  @Input() public readonly name: string | null = null;
}

// A module which declares and exports the dependency component.
@NgModule({
  declarations: [DependencyComponent],
  exports: [DependencyComponent],
})
class DependencyModule {}

// A standalone component we are going to test.
@Component({
  selector: 'standalone',
  template: `<dependency-standalone-component [name]="name">{{
    name | standalone
  }}</dependency-standalone-component>`,
  standalone: true,
  imports: [DependencyModule, StandalonePipe],
} as never)
class StandaloneComponent {
  @Input() public readonly name: string | null = null;
}

describe('TestStandaloneComponent', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    return MockBuilder(StandaloneComponent);
  });

  it('renders dependencies', () => {
    const fixture = MockRender(StandaloneComponent, {
      name: 'test',
    });

    // asserting that we passed the input
    const dependencyComponent = ngMocks.findInstance(
      DependencyComponent,
    );
    expect(dependencyComponent.name).toEqual('test');

    // asserting how we called the pipe
    const standalonePipe = ngMocks.findInstance(StandalonePipe);
    // it's possible because of autoSpy.
    expect(standalonePipe.transform).toHaveBeenCalledWith('test');

    // or asserting the generated html
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<standalone ng-reflect-name="test"><dependency-standalone-component ng-reflect-name="test"></dependency-standalone-component></standalone>',
    );
  });
});
