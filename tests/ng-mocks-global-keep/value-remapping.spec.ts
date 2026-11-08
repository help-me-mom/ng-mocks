import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  getMockedNgDefOf,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-global-keep-value-remapping',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class TargetComponent {}

class ProviderValue implements PipeTransform {
  public readonly nested = { declaration: TargetComponent };

  public transform(value: string): string {
    return `${value}:provider`;
  }
}

const providerValue = new ProviderValue();

@Injectable()
@Pipe({
  name: 'keptRemappingPipe',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `${value}:pipe`;
  }
}

@NgModule({
  declarations: [TargetComponent, TargetPipe],
  providers: [{ provide: TargetPipe, useValue: providerValue }],
})
class TargetModule {}

describe('ng-mocks-global-keep:value remapping', () => {
  afterEach(() => ngMocks.globalWipe(TargetPipe));

  it('remaps declaration references in a kept declaration provider without mutating its value', async () => {
    ngMocks.globalKeep(TargetPipe);
    await MockBuilder(null, TargetModule);

    const fixture = MockRender('{{ "target" | keptRemappingPipe }}');
    const actual = ngMocks.get(TargetPipe);

    if (!(actual instanceof ProviderValue)) {
      throw new Error('Expected the original provider recipe type');
    }

    // Keeping the declaration must still process references inside its provider recipe.
    expect(ngMocks.formatText(fixture)).toEqual('target:pipe');
    expect(actual).not.toBe(providerValue);
    expect(actual.nested).not.toBe(providerValue.nested);
    expect(actual.nested.declaration).toBe(
      getMockedNgDefOf(TargetComponent, 'c'),
    );
    expect(actual.nested.declaration).not.toBe(TargetComponent);
    expect(actual.transform('target')).toEqual('target:provider');
    expect(providerValue.nested.declaration).toBe(TargetComponent);
  });
});
