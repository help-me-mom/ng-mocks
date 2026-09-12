import { MockedDebugNode } from '../../mock-render/types';

import funcGetPublicProviderKeys from './func.get-public-provider-keys';

describe('func.get-public-provider-keys', () => {
  it('excludes ancestor providers when a child shares their map', () => {
    const parent = { element: { publicProviders: {} } };
    parent.element.publicProviders = { ancestor: { parent } };
    const child = {
      element: { publicProviders: parent.element.publicProviders },
    };
    const parentNode = {
      injector: { elDef: parent },
    } as unknown as MockedDebugNode;
    const childNode = {
      injector: { elDef: child },
    } as unknown as MockedDebugNode;

    expect(funcGetPublicProviderKeys(parentNode)).toEqual([
      'ancestor',
    ]);
    expect(funcGetPublicProviderKeys(childNode)).toEqual([]);
    expect(funcGetPublicProviderKeys(parentNode)).toEqual([
      'ancestor',
    ]);
  });

  it('includes local providers without including inherited map entries', () => {
    const parent = { element: { publicProviders: {} } };
    parent.element.publicProviders = { ancestor: { parent } };
    const child = { element: { publicProviders: {} } };
    const providers = Object.create(
      parent.element.publicProviders,
    ) as Record<string, { parent: typeof child }>;
    providers.local = { parent: child };
    child.element.publicProviders = providers;
    const node = {
      injector: { elDef: child },
    } as unknown as MockedDebugNode;

    expect(funcGetPublicProviderKeys(node)).toEqual(['local']);
  });

  it('returns no classic provider keys for empty and Ivy injectors', () => {
    for (const injector of [{}, { _tNode: {} }]) {
      const node = { injector } as unknown as MockedDebugNode;

      expect(funcGetPublicProviderKeys(node)).toEqual([]);
    }
  });
});
