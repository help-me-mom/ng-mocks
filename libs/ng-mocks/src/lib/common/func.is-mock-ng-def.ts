import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

export function isMockNgDef<T>(component: Type<T>, ngType: 'c'): component is Type<MockedComponent<T>>;

export function isMockNgDef<T>(directive: Type<T>, ngType: 'd'): directive is Type<MockedDirective<T>>;

export function isMockNgDef<T>(pipe: Type<T>, ngType: 'p'): pipe is Type<MockedPipe<T>>;

export function isMockNgDef<T>(module: Type<T>, ngType: 'm'): module is Type<MockedModule<T>>;

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
