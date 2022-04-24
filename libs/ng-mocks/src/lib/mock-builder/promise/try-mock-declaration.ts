import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockComponent } from '../../mock-component/mock-component';
import { MockDirective } from '../../mock-directive/mock-directive';
import { MockPipe } from '../../mock-pipe/mock-pipe';

export default (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'c')) {
    ngMocksUniverse.builtDeclarations.set(def, MockComponent(def));
  }
  if (isNgDef(def, 'd')) {
    ngMocksUniverse.builtDeclarations.set(def, MockDirective(def));
  }
  if (isNgDef(def, 'p')) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtDeclarations.set(
      def,
      typeof instance?.transform === 'function' ? MockPipe(def, instance.transform) : MockPipe(def),
    );
  }
};
