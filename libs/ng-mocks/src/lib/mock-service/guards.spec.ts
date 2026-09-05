import { Injectable, InjectionToken, NgModule } from '@angular/core';

import { NG_MOCKS_GUARDS } from '../common/core.tokens';
import { MockBuilder } from '../mock-builder/mock-builder';
import { ngMocks } from '../mock-helper/mock-helper';

@Injectable()
class ClassGuard {
  public canActivate() {
    return true;
  }
}

const functionGuard = () => true;
const tokenGuard = new InjectionToken('tokenGuard');
const routesToken = new InjectionToken<any>('routes');

for (const guard of [
  'canActivate',
  'canActivateChild',
  'canDeactivate',
  'canLoad',
  'canMatch',
]) {
  describe(`NG_MOCKS_GUARDS:${guard}`, () => {
    const guards = [ClassGuard, functionGuard, tokenGuard];
    const routes = [
      {
        path: 'parent',
        children: [{ path: 'child', [guard]: guards }],
      },
    ];

    @NgModule({
      providers: [
        ClassGuard,
        { provide: tokenGuard, useValue: () => true },
        { provide: routesToken, useValue: routes },
      ],
    })
    class TargetModule {}

    it('preserves guards by default without changing the original routes', async () => {
      await MockBuilder().mock(TargetModule).keep(routesToken);

      expect(ngMocks.get(routesToken)).toEqual(routes);
      expect(routes[0].children[0][guard]).toEqual([
        ClassGuard,
        functionGuard,
        tokenGuard,
      ]);
    });

    it('removes all guards from nested routes without changing the original routes', async () => {
      await MockBuilder()
        .mock(TargetModule)
        .keep(routesToken)
        .exclude(NG_MOCKS_GUARDS);

      expect(ngMocks.get(routesToken)).toEqual([
        {
          path: 'parent',
          children: [{ path: 'child', [guard]: [] }],
        },
      ]);
      expect(routes[0].children[0][guard]).toEqual([
        ClassGuard,
        functionGuard,
        tokenGuard,
      ]);
    });

    for (const keptGuard of guards) {
      it(`keeps the selected ${keptGuard === ClassGuard ? 'class' : keptGuard === functionGuard ? 'function' : 'token'} guard`, async () => {
        await MockBuilder()
          .mock(TargetModule)
          .keep(routesToken)
          .exclude(NG_MOCKS_GUARDS)
          .keep(keptGuard);

        expect(ngMocks.get(routesToken)).toEqual([
          {
            path: 'parent',
            children: [{ path: 'child', [guard]: [keptGuard] }],
          },
        ]);
        expect(routes[0].children[0][guard]).toEqual([
          ClassGuard,
          functionGuard,
          tokenGuard,
        ]);
      });
    }

    it('removes a mocked guard from routes while preserving its mock provider', async () => {
      const mockGuard = { canActivate: () => false };
      await MockBuilder()
        .mock(TargetModule)
        .keep(routesToken)
        .exclude(NG_MOCKS_GUARDS)
        .mock(ClassGuard, mockGuard);

      expect(ngMocks.get(routesToken)).toEqual([
        {
          path: 'parent',
          children: [{ path: 'child', [guard]: [] }],
        },
      ]);
      expect(ngMocks.get(ClassGuard).canActivate()).toEqual(false);
    });

    it('uses directly provided routes as supplied', async () => {
      await MockBuilder()
        .exclude(NG_MOCKS_GUARDS)
        .provide({ provide: routesToken, useValue: routes });

      expect(ngMocks.get(routesToken)).toBe(routes);
      expect(ngMocks.get(routesToken)[0].children[0][guard]).toEqual([
        ClassGuard,
        functionGuard,
        tokenGuard,
      ]);
    });

    it('uses an explicit provider for a kept guard', async () => {
      const providedGuard = { canActivate: () => false };
      await MockBuilder()
        .mock(TargetModule)
        .keep(routesToken)
        .exclude(NG_MOCKS_GUARDS)
        .keep(ClassGuard)
        .provide({ provide: ClassGuard, useValue: providedGuard });

      expect(ngMocks.get(routesToken)).toEqual([
        {
          path: 'parent',
          children: [{ path: 'child', [guard]: [ClassGuard] }],
        },
      ]);
      expect(ngMocks.get(ClassGuard)).toBe(providedGuard);
    });

    it('removes an individually excluded guard without removing other guards', async () => {
      await MockBuilder()
        .mock(TargetModule)
        .keep(routesToken)
        .exclude(tokenGuard);

      expect(ngMocks.get(routesToken)).toEqual([
        {
          path: 'parent',
          children: [
            { path: 'child', [guard]: [ClassGuard, functionGuard] },
          ],
        },
      ]);
      expect(routes[0].children[0][guard]).toEqual([
        ClassGuard,
        functionGuard,
        tokenGuard,
      ]);
    });
  });
}
