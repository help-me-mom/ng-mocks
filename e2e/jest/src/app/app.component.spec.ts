import {
  MockBuilder,
  MockInstance,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { AppService } from './app.service';

ngMocks.defaultMock(AppService, () => ({
  echo1: () => 'echo1',
  echo3: () => '',
}));

describe('app-component', () => {
  // A fix until https://github.com/facebook/jest/issues/11483 has been merged.
  MockInstance.scope('all');
  MockInstance.scope();

  const factory = MockRenderFactory(AppComponent, ['scope']);
  ngMocks.faster();
  beforeAll(() => MockBuilder(AppComponent, AppModule));
  beforeAll(() => MockInstance(AppService, 'echo2', () => 'echo2'));

  it('creates the component', () => {
    MockInstance(AppService, 'echo2', () => 'echo');
    const fixture = factory();
    expect(ngMocks.formatText(fixture)).toEqual('ng-mocks:');
    expect(fixture.point.componentInstance.service.echo1()).toEqual(
      'echo1',
    );
    expect(fixture.point.componentInstance.service.echo2()).toEqual(
      'echo',
    );
    expect(fixture.point.componentInstance.service.echo3()).toEqual(
      '',
    );
  });

  it('respects the scope of the component', () => {
    MockInstance(AppService, 'echo1', () => 'echo');
    const fixture = factory({ scope: 'test' });
    expect(ngMocks.formatText(fixture)).toEqual('ng-mocks:test');
    expect(fixture.point.componentInstance.service.echo1()).toEqual(
      'echo',
    );
    expect(fixture.point.componentInstance.service.echo2()).toEqual(
      'echo2',
    );
    expect(fixture.point.componentInstance.service.echo3()).toEqual(
      '',
    );
  });

  it('respects MockInstance', () => {
    MockInstance(AppService, 'echo3', () => 'echo3');
    const fixture = factory({ scope: 'test' });
    expect(ngMocks.formatText(fixture)).toEqual('ng-mocks:test');
    expect(fixture.point.componentInstance.service.echo1()).toEqual(
      'echo1',
    );
    expect(fixture.point.componentInstance.service.echo2()).toEqual(
      'echo2',
    );
    expect(fixture.point.componentInstance.service.echo3()).toEqual(
      'echo3',
    );
  });
});
