import {
  Component,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
abstract class AbstractService {
  public readonly name = '';
}

@Component({
  providers: [
    {
      provide: TOKEN,
      useValue: 'token1',
    },
    {
      provide: AbstractService,
      useFactory: () => ({ name: 'service1' }),
    },
  ],
  selector: 'target1-2097',
  template: ' 1 ',
})
class Target1Component {}

@Component({
  providers: [
    {
      provide: TOKEN,
      useValue: 'token2',
    },
    {
      provide: AbstractService,
      useFactory: () => ({ name: 'service2' }),
    },
  ],
  selector: 'target2-2097',
  template: ' 2 ',
})
class Target2Component {}

@NgModule({
  declarations: [Target1Component, Target2Component],
  providers: [
    {
      provide: TOKEN,
      useValue: 'token',
    },
    {
      provide: AbstractService,
      useValue: { name: 'service' },
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/2097
describe('issue-2097', () => {
  beforeEach(() =>
    MockBuilder(
      [Target1Component, Target2Component, TOKEN],
      TargetModule,
    ),
  );

  it('finds tokens', () => {
    const fixture = MockRender(`
      <div class="root">
        <target1-2097></target1-2097>
        <target2-2097></target2-2097>
        <div class="child child1">
          <target1-2097></target1-2097>
          <target2-2097></target2-2097>
        </div>
        <div class="child child2">
          <target1-2097></target1-2097>
          <target2-2097></target2-2097>
          <div class="child child3">
            <target1-2097></target1-2097>
            <target2-2097></target2-2097>
          </div>
        </div>
      </div>
    `);

    expect(ngMocks.formatText(fixture)).toEqual('1 2 1 2 1 2 1 2');

    {
      const token = ngMocks.get('target1-2097', TOKEN);
      expect(token).toEqual('token1');
      const service = ngMocks.get('target1-2097', AbstractService);
      expect(service.name).toEqual('service1');
    }
    {
      const token = ngMocks.get('target2-2097', TOKEN);
      expect(token).toEqual('token2');
      const service = ngMocks.get('target2-2097', AbstractService);
      expect(service.name).toEqual('service2');
    }
    {
      const token = ngMocks.findInstance('target1-2097', TOKEN);
      expect(token).toEqual('token1');
      const service = ngMocks.findInstance(
        'target1-2097',
        AbstractService,
      );
      expect(service.name).toEqual('service1');
    }
    {
      const token = ngMocks.findInstance('target2-2097', TOKEN);
      expect(token).toEqual('token2');
      const service = ngMocks.findInstance(
        'target2-2097',
        AbstractService,
      );
      expect(service.name).toEqual('service2');
    }
    {
      const tokens = ngMocks.findInstances('target1-2097', TOKEN);
      expect(tokens).toEqual([
        'token1',
        'token1',
        'token1',
        'token1',
      ]);
      const services = ngMocks.findInstances(
        'target1-2097',
        AbstractService,
      );
      expect(services as any).toEqual([
        { name: 'service1' },
        { name: 'service1' },
        { name: 'service1' },
        { name: 'service1' },
      ]);
    }
    {
      const tokens = ngMocks.findInstances('target2-2097', TOKEN);
      expect(tokens).toEqual([
        'token2',
        'token2',
        'token2',
        'token2',
      ]);
      const services = ngMocks.findInstances(
        'target2-2097',
        AbstractService,
      );
      expect(services as any).toEqual([
        { name: 'service2' },
        { name: 'service2' },
        { name: 'service2' },
        { name: 'service2' },
      ]);
    }
    {
      const tokens = ngMocks.findInstances(
        '.child2 target2-2097',
        TOKEN,
      );
      expect(tokens).toEqual(['token2', 'token2']);
      const services = ngMocks.findInstances(
        '.child2 target2-2097',
        AbstractService,
      );
      expect(services as any).toEqual([
        { name: 'service2' },
        { name: 'service2' },
      ]);
    }
  });

  it('fails on unknown tokens', () => {
    MockRender();
    expect(() =>
      ngMocks.findInstance(new InjectionToken('TOKEN')),
    ).toThrowError(
      'Cannot find an instance via ngMocks.findInstance(TOKEN)',
    );
  });
});
