import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

/**
 * isMockNgDef verifies whether a class is a mock component class.
 *
 * @internal
 *
 * ```ts
 * isMockNgDef(MockComponent, 'c'); // returns true
 * isMockNgDef(RealComponent, 'c'); // returns false
 * isMockNgDef(ArbitraryClass, 'c'); // returns false
 * ```
 */
export function isMockNgDef<T>(component: Type<T>, ngType: 'c'): component is Type<MockedComponent<T>>;

/**
 * isMockNgDef verifies whether a class is a mock directive class.
 *
 * @internal
 *
 * ```ts
 * isMockNgDef(MockDirective, 'd'); // returns true
 * isMockNgDef(RealDirective, 'd'); // returns false
 * isMockNgDef(ArbitraryClass, 'd'); // returns false
 * ```
 */
export function isMockNgDef<T>(directive: Type<T>, ngType: 'd'): directive is Type<MockedDirective<T>>;

/**
 * isMockNgDef verifies whether a class is a mock pipe class.
 *
 * @internal
 *
 * ```ts
 * isMockNgDef(MockPipe, 'p'); // returns true
 * isMockNgDef(RealPipe, 'p'); // returns false
 * isMockNgDef(ArbitraryClass, 'p'); // returns false
 * ```
 */
export function isMockNgDef<T>(pipe: Type<T>, ngType: 'p'): pipe is Type<MockedPipe<T>>;

/**
 * isMockNgDef verifies whether a class is a mock module class.
 *
 * @internal
 *
 * ```ts
 * isMockNgDef(MockModule, 'm'); // returns true
 * isMockNgDef(RealModule, 'm'); // returns false
 * isMockNgDef(ArbitraryClass, 'm'); // returns false
 * ```
 */
export function isMockNgDef<T>(module: Type<T>, ngType: 'm'): module is Type<MockedModule<T>>;

/**
 * isMockNgDef verifies whether a class is a mock class.
 *
 * @internal
 *
 * ```ts
 * isMockNgDef(MockComponent); // returns true
 * isMockNgDef(RealModule); // returns false
 * isMockNgDef(ArbitraryClass); // returns false
 * ```
 */
export function isMockNgDef<T>(module: Type<T>): module is Type<T>;

export function isMockNgDef<TComponent>(
  component: Type<TComponent> & { mockOf?: any },
  type?: 'c' | 'd' | 'p' | 'm',
): component is Type<TComponent> {
  if (!(component as any).mockOf) {
    return false;
  }
  if (!type) {
    return true;
  }

  return isNgDef(component.mockOf, type as never);
}
