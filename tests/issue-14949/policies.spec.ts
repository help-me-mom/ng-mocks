import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class OrdinaryService {
  public readonly name: string = 'ordinary root';
}

class RecipeService {
  public readonly name!: string;

  public constructor() {
    throw new Error('recipe token constructor');
  }
}

let rootCalls = 0;
Injectable({
  providedIn: 'root',
  useFactory: () => {
    rootCalls += 1;

    return { name: 'recipe root' };
  },
})(RecipeService);

class ProviderValue {
  public constructor(public readonly name: string) {}
}

const ordinaryModuleValue = new ProviderValue('ordinary module');
const recipeModuleValue = new ProviderValue('recipe module');

@NgModule({
  providers: [
    { provide: OrdinaryService, useValue: ordinaryModuleValue },
    { provide: RecipeService, useValue: recipeModuleValue },
  ],
})
class TargetModule {}

let parentConstructions = 0;
class ParentService {
  public readonly name: string = 'parent constructor';

  public constructor() {
    if (this.constructor === ParentService) {
      parentConstructions += 1;
    }
  }
}
Injectable({ providedIn: 'root' })(ParentService);

class ChildService extends ParentService {
  public readonly name = 'child constructor';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14949
describe('issue-14949:policies', () => {
  beforeEach(() => {
    rootCalls = 0;
    parentConstructions = 0;
  });

  it('preserves the module provider for an ordinary kept service', async () => {
    await MockBuilder(OrdinaryService, TargetModule);

    const service =
      MockRender(OrdinaryService).point.componentInstance;

    expect(service).toBe(ordinaryModuleValue);
    expect(service.name).toBe('ordinary module');
  });

  it('preserves the module provider for a kept JIT recipe token', async () => {
    await MockBuilder(RecipeService, TargetModule);

    const service = MockRender(RecipeService).point.componentInstance;

    expect(service).toBe(recipeModuleValue);
    expect(rootCalls).toBe(0);
  });

  it('gives an explicit provider priority over the root recipe', async () => {
    const provided = new ProviderValue('provided');
    await MockBuilder(RecipeService).provide({
      provide: RecipeService,
      useValue: provided,
    });

    const service = MockRender(RecipeService).point.componentInstance;

    expect(service).toBe(provided);
    expect(rootCalls).toBe(0);
  });

  it('gives an explicit provider priority over the module recipe', async () => {
    const provided = new ProviderValue('provided');
    await MockBuilder(RecipeService, TargetModule).provide({
      provide: RecipeService,
      useValue: provided,
    });

    const service = MockRender(RecipeService).point.componentInstance;

    expect(service).toBe(provided);
    expect(rootCalls).toBe(0);
  });

  it('does not eagerly execute the root recipe while building', async () => {
    await MockBuilder().keep(RecipeService);

    expect(rootCalls).toBe(0);

    const service = MockRender(RecipeService).point.componentInstance;

    expect(service.name).toBe('recipe root');
    expect(ngMocks.get(RecipeService)).toBe(service);
    expect(rootCalls).toBe(1);
  });

  it('constructs the child when Angular provides it directly', () => {
    TestBed.configureTestingModule({ providers: [ChildService] });

    const service = ngMocks.get(ChildService);

    expect(service instanceof ChildService).toBe(true);
    expect(service.name).toBe('child constructor');
    expect(ngMocks.get(ChildService)).toBe(service);
    expect(parentConstructions).toBe(0);
  });

  it('preserves native child construction when static definitions are copied', async () => {
    class CopiedChildService extends ParentService {
      public readonly name = 'copied child constructor';
    }
    // Legacy static inheritance can copy the parent's enumerable ngInjectableDef.
    Object.assign(CopiedChildService, ParentService);
    TestBed.configureTestingModule({
      providers: [CopiedChildService],
    });

    const native = ngMocks.get(CopiedChildService);

    expect(native instanceof CopiedChildService).toBe(true);
    expect(native.name).toBe('copied child constructor');
    expect(ngMocks.get(CopiedChildService)).toBe(native);
    expect(parentConstructions).toBe(0);

    TestBed.resetTestingModule();
    await MockBuilder().keep(CopiedChildService);

    const service = MockRender(CopiedChildService).point
      .componentInstance;

    expect(service instanceof CopiedChildService).toBe(true);
    expect(service.name).toBe(native.name);
    expect(ngMocks.get(CopiedChildService)).toBe(service);
    expect(service).not.toBe(native);
    expect(parentConstructions).toBe(0);
  });

  it('constructs a kept child instead of executing its inherited root recipe', async () => {
    await MockBuilder().keep(ChildService);

    const service = MockRender(ChildService).point.componentInstance;

    expect(service instanceof ChildService).toBe(true);
    expect(service.name).toBe('child constructor');
    expect(parentConstructions).toBe(0);
  });

  it('constructs a target child instead of executing its inherited root recipe', async () => {
    await MockBuilder(ChildService);

    const service = MockRender(ChildService).point.componentInstance;

    expect(service instanceof ChildService).toBe(true);
    expect(service.name).toBe('child constructor');
    expect(parentConstructions).toBe(0);
  });
});
