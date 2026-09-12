import { QueryList, ViewContainerRef } from '@angular/core';
import { TestBed, TestBedStatic } from '@angular/core/testing';

import helperCreateClone from '../mock-service/helper.create-clone';

import coreDefineProperty from './core.define-property';
import coreInjector from './core.injector';
import { NG_MOCKS } from './core.tokens';

// Monkey-patching ViewContainerRef.createComponent to replace dynamic imports with mocked declarations.
const patchVcrInstance = (vcrInstance: ViewContainerRef) => {
  const prototype = vcrInstance.constructor.prototype;
  const createComponent = vcrInstance.createComponent;
  if (createComponent && !Object.prototype.hasOwnProperty.call(prototype, 'ngMocksOverridesPatched')) {
    // Inheriting a patched method needs no second wrapper; an overriding implementation does.
    if (!(createComponent as any).ngMocksOverridesPatched) {
      const patchedCreateComponent = helperCreateClone(
        createComponent,
        undefined,
        undefined,
        function (component: any, ...createComponentArgs: any[]) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const thisVrc: ViewContainerRef = this;
          const map = coreInjector(NG_MOCKS, thisVrc.injector);

          return createComponent.apply(thisVrc, [map?.get(component) ?? component, ...createComponentArgs] as any);
        },
      );

      coreDefineProperty(patchedCreateComponent, 'ngMocksOverridesPatched', true);
      coreDefineProperty(prototype, 'createComponent', patchedCreateComponent, true);
      coreDefineProperty(vcrInstance, 'createComponent', patchedCreateComponent, true);
    }

    // Keep later instance spies local instead of copying them onto the shared prototype.
    coreDefineProperty(prototype, 'ngMocksOverridesPatched', true);
  }
};

const queryListReset = (original: QueryList<any>['reset']): QueryList<any>['reset'] =>
  helperCreateClone(original, undefined, undefined, function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const thisQueryList: QueryList<any> = this;
    const result = original.apply(thisQueryList, args as any);

    // Both decorator and signal queries can create containers without invoking __NG_ELEMENT_ID__.
    // Inspect Angular's retained results before setters or query consumers receive them.
    QueryList.prototype.forEach.call(thisQueryList, (value: any) => {
      if (value instanceof ViewContainerRef) {
        patchVcrInstance(value);
      }
    });

    return result;
  });

// istanbul ignore next: legacy Angular lacks __NG_ELEMENT_ID__; covered by the compatibility matrix.
const createComponent =
  (original: TestBedStatic['createComponent'], instance: TestBedStatic): TestBedStatic['createComponent'] =>
  // istanbul ignore next: legacy Angular lacks __NG_ELEMENT_ID__; covered by the compatibility matrix.
  (...args) => {
    const fixture = original.call(instance, ...args);
    try {
      const vcr = fixture.debugElement.injector.get(ViewContainerRef);
      patchVcrInstance(vcr);
    } catch {
      // nothing to do
    }

    return fixture as never;
  };

export const installViewContainer = () => {
  const vcr: any = ViewContainerRef;

  // istanbul ignore else
  if (!vcr.ngMocksOverridesInstalled) {
    coreDefineProperty(QueryList.prototype, 'reset', queryListReset(QueryList.prototype.reset), true);
    const ngElementId = vcr.__NG_ELEMENT_ID__;

    // istanbul ignore else
    if (ngElementId) {
      coreDefineProperty(
        vcr,
        '__NG_ELEMENT_ID__',
        helperCreateClone(ngElementId, undefined, undefined, (...ngElementIdArgs: any[]) => {
          const vcrInstance = ngElementId.apply(ngElementId, ngElementIdArgs);
          patchVcrInstance(vcrInstance);

          return vcrInstance;
        }),
        true,
      );
    } else {
      coreDefineProperty(
        TestBed,
        'createComponent',
        createComponent(TestBed.createComponent as never, TestBed as never),
      );
    }

    coreDefineProperty(ViewContainerRef, 'ngMocksOverridesInstalled', true);
  }
};
