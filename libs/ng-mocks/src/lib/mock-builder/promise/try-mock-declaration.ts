import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockComponent } from '../../mock-component/mock-component';
import { MockDirective } from '../../mock-directive/mock-directive';
import { MockPipe } from '../../mock-pipe/mock-pipe';

export default (def: any): void => {
  if (isNgDef(def, 'c')) {
    ngMocksUniverse.builtDeclarations.set(def, MockComponent(def));
  }
  if (isNgDef(def, 'd')) {
    ngMocksUniverse.builtDeclarations.set(def, MockDirective(def));
  }
  if (isNgDef(def, 'p')) {
    ngMocksUniverse.builtDeclarations.set(def, MockPipe(def));
  }
};
