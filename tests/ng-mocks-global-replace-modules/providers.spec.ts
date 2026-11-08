import { Injectable, NgModule } from '@angular/core';

import { isMockOf, MockBuilder, ngMocks } from 'ng-mocks';

let constructed = 0;
let replaced = 0;

@Injectable()
class TargetService {
  public readonly instance = ++constructed;

  public name(): string {
    return 'original';
  }
}

@NgModule({ providers: [TargetService] })
class TargetModule {}

@NgModule({
  providers: [
    {
      provide: TargetService,
      useFactory: () => {
        replaced += 1;

        return { name: () => 'replacement' };
      },
    },
  ],
})
class ReplacementModule {}

@NgModule({
  providers: [
    { provide: TargetService, useValue: { name: () => 'alternate' } },
  ],
})
class AlternateModule {}

@NgModule({ imports: [TargetModule] })
class EntryModule {}

// A global replacement's provider keeps must not survive an explicit module override.
describe('ng-mocks-global-replace-modules:providers', () => {
  beforeEach(() => {
    constructed = 0;
    replaced = 0;
    ngMocks.globalReplace(TargetModule, ReplacementModule);
  });
  afterEach(() => ngMocks.globalWipe(TargetModule));

  it('retains the active global replacement provider recipe', async () => {
    await MockBuilder(null, EntryModule);

    expect(ngMocks.get(TargetService).name()).toEqual('replacement');
    expect(constructed).toEqual(0);
    expect(replaced).toEqual(1);
  });

  it('mocks original providers when an explicit mock overrides the replacement', async () => {
    await MockBuilder(null, EntryModule).mock(TargetModule);

    expect(isMockOf(ngMocks.get(TargetService), TargetService)).toBe(
      true,
    );
    expect(ngMocks.get(TargetService).name()).toBeUndefined();
    expect(constructed).toEqual(0);
    expect(replaced).toEqual(0);
  });

  it('keeps original providers when an explicit keep overrides the replacement', async () => {
    await MockBuilder(null, EntryModule).keep(TargetModule);

    expect(ngMocks.get(TargetService).name()).toEqual('original');
    expect(constructed).toEqual(1);
    expect(replaced).toEqual(0);
  });

  it('omits providers when an explicit exclusion overrides the replacement', async () => {
    await MockBuilder(null, EntryModule).exclude(TargetModule);

    expect(() => ngMocks.get(TargetService)).toThrow();
    expect(constructed).toEqual(0);
    expect(replaced).toEqual(0);
  });

  it('uses the current explicit replacement without retaining the global replacement recipe', async () => {
    await MockBuilder(null, EntryModule).replace(
      TargetModule,
      AlternateModule,
    );

    expect(ngMocks.get(TargetService).name()).toEqual('alternate');
    expect(constructed).toEqual(0);
    expect(replaced).toEqual(0);
  });
});
