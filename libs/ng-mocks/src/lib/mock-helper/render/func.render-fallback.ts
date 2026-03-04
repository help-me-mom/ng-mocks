import { ElementRef, EmbeddedViewRef, TemplateRef } from '@angular/core';

import coreInjector from '../../common/core.injector';

type FallbackView = {
  template: TemplateRef<any>;
  view: EmbeddedViewRef<any>;
};

export type FallbackInstance = {
  __ngMocksConfig?: {
    queryScanKeys?: any;
  };
  __ngMocksCtor?: {
    mockOf?: {
      ɵcmp?: any;
    };
  };
  __ngMocksInjector: any;
  __ngMocksRenderFallbackViews?: FallbackView[];
};

const getFallbackViews = (instance: FallbackInstance): FallbackView[] => {
  if (!instance.__ngMocksRenderFallbackViews) {
    instance.__ngMocksRenderFallbackViews = [];
  }

  return instance.__ngMocksRenderFallbackViews;
};

const detachView = (view: EmbeddedViewRef<any>): void => {
  for (const node of view.rootNodes || []) {
    if (node?.parentNode) {
      // Compatibility with non-DOM test stubs where remove() might not exist.
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      node.parentNode.removeChild(node);
    }
  }
  view.destroy();
};

const clearFallbackViews = (instance: FallbackInstance, template?: TemplateRef<any>): boolean => {
  const fallbackViews = getFallbackViews(instance);
  let hasChanges = false;

  for (let index = fallbackViews.length - 1; index >= 0; index -= 1) {
    const fallbackView = fallbackViews[index];
    if (template && fallbackView.template.elementRef.nativeElement !== template.elementRef.nativeElement) {
      continue;
    }

    detachView(fallbackView.view);
    fallbackViews.splice(index, 1);
    hasChanges = true;
  }

  return hasChanges;
};

const getHost = (instance: FallbackInstance): any => {
  const injector = instance.__ngMocksInjector;
  const elementRef = coreInjector(ElementRef, injector);

  return elementRef?.nativeElement;
};

const canUseFallback = (instance: FallbackInstance): boolean => {
  const source = instance.__ngMocksCtor?.mockOf;
  // Restrict fallback to mocked components only.
  if (!source?.ɵcmp) {
    return false;
  }

  const queryScanKeys = instance.__ngMocksConfig?.queryScanKeys;
  // Keep legacy behavior when ng-mocks knows query paths.
  if (!Array.isArray(queryScanKeys) || queryScanKeys.length > 0) {
    return false;
  }

  return true;
};

export const fallbackRender = (
  instance: FallbackInstance,
  template: TemplateRef<any>,
  context: Record<keyof any, any>,
): boolean => {
  if (!canUseFallback(instance)) {
    return false;
  }

  const host = getHost(instance);
  if (!host) {
    return false;
  }

  // Angular 20 signal queries in some libraries (for example ng-select) do not expose
  // metadata in a shape that ng-mocks can scan via queryScanKeys. In that narrow case
  // we render directly into the component host as a best-effort fallback.
  clearFallbackViews(instance);

  const view = template.createEmbeddedView(context);
  view.detectChanges();

  for (const node of view.rootNodes || []) {
    // Keep appendChild to support old node stubs in compatibility tests.
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    host.appendChild(node);
  }

  getFallbackViews(instance).push({
    template,
    view,
  });

  return true;
};

export const fallbackHide = (instance: FallbackInstance, template?: TemplateRef<any>): boolean => {
  if (!canUseFallback(instance)) {
    return false;
  }

  return clearFallbackViews(instance, template);
};
