import { ChangeDetectorRef, Injector, NgModuleRef } from '@angular/core';
import * as angularCore from '@angular/core';

import coreDefineProperty from '../common/core.define-property';
import funcIsMock from '../common/func.is-mock';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockHelperStubMember from '../mock-helper/mock-helper.stub-member';

type InstanceRecord = { instance: any; injector?: Injector };
const instances = new Map<any, Map<any, InstanceRecord>>();
const ivyDestroyKey = '__ngMocksInstanceDestroy';

const destroyIvyInstances = function (this: Set<() => void> | undefined): void {
  if (!this) {
    return;
  }
  for (const callback of this) {
    callback();
  }
  this.clear();
};

const resolveIvyLifetime = (lView: any): { onDestroy: (callback: () => void) => void } => ({
  onDestroy: callback => {
    const callbacks: Set<() => void> = lView[ivyDestroyKey] || new Set();
    coreDefineProperty(lView, ivyDestroyKey, callbacks);
    callbacks.add(callback);

    // In Angular 9-15, ViewRef.onDestroy can corrupt or freeze template cleanup during
    // construction. Use a shared destroy hook with an instance-specific context instead.
    // TVIEW is slot 1 in these Ivy versions; a named LView slot avoids compiler-owned indices.
    const tView = lView[1];
    const hooks: any[] = tView.destroyHooks || (tView.destroyHooks = []);
    if (hooks.indexOf(destroyIvyInstances) === -1) {
      hooks.push(ivyDestroyKey, destroyIvyInstances);
    }
  },
});

// DestroyRef is optional because the published package also supports Angular 5-15.
export const resolveInstanceLifetime = (
  injector: Injector,
  destroyRef: any = (angularCore as any).DestroyRef,
): { onDestroy: (callback: () => void) => unknown } | undefined => {
  if (typeof (injector as any).onDestroy === 'function') {
    return injector as never;
  }
  if (destroyRef) {
    return injector.get(destroyRef, undefined);
  }
  if ((injector as any)._lView) {
    return resolveIvyLifetime((injector as any)._lView);
  }

  const view = injector.get(ChangeDetectorRef, null) as any;
  // A ChangeDetectorRef can point at the containing component rather than the
  // embedded view owning this injector. Bind a separate reference to the owner
  // for View Engine, leaving Angular's original reference intact.
  if (view?._view && (injector as any).view) {
    return Object.assign(Object.create(view), { _view: (injector as any).view });
  }
  return view || injector.get(NgModuleRef, undefined);
};

export const resetMockInstances = (): void => {
  instances.clear();
};

export const rememberMockInstance = (declaration: any, instance: any, injector?: Injector): void => {
  if (typeof declaration !== 'function' || !funcIsMock(instance)) {
    return;
  }

  const records = instances.get(declaration) || new Map<any, InstanceRecord>();
  if (records.has(instance)) {
    return;
  }
  instances.set(declaration, records);
  records.set(instance, { instance, injector });

  if (injector) {
    const remove = () => {
      records.delete(instance);
      if (records.size === 0 && instances.get(declaration) === records) {
        instances.delete(declaration);
      }
    };
    try {
      resolveInstanceLifetime(injector)?.onDestroy(remove);
    } catch {
      // Custom injectors may not provide a lifetime. TestBed reset still releases their records.
    }
  }
};

export const updateMockInstances = (
  declaration: any,
  name: string | undefined,
  stub: any,
  accessor?: 'get' | 'set',
): void => {
  const records = instances.get(declaration);
  if (!records) {
    return;
  }

  // A callback may create another mock or destroy one. New instances already receive the
  // registered configuration at creation, so only visit the original, still-live records.
  // eslint-disable-next-line unicorn/prefer-iterator-to-array -- Older supported runtimes lack Iterator.toArray.
  const snapshot = [...records.values()];
  for (const record of snapshot) {
    if (instances.get(declaration) !== records || !records.has(record.instance)) {
      continue;
    }
    if (name) {
      mockHelperStubMember(record.instance, name, stub, accessor);
    } else if (stub) {
      const overrides = stub(record.instance, record.injector);
      if (overrides) {
        mockHelperStub(record.instance, overrides);
      }
    }
  }
};
