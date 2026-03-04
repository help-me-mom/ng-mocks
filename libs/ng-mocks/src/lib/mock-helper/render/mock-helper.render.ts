import funcFindDeep from './func.find-deep';
import funcParseTemplate from './func.parse-template';
import { fallbackRender, FallbackInstance } from './func.render-fallback';

export default (instance: object, param: object, $implicit?: any, variables?: Record<keyof any, any>) => {
  const template = funcParseTemplate(param);

  let result = funcFindDeep(
    instance,
    tpl => tpl.elementRef.nativeElement === template.elementRef.nativeElement,
    (vcr, tpl) => {
      const context = {
        ...variables,
        $implicit,
      };
      vcr.clear();
      vcr.createEmbeddedView(tpl, context).detectChanges();

      return true;
    },
  );

  if (!result) {
    result = fallbackRender(instance as FallbackInstance, template, {
      ...variables,
      $implicit,
    });
  }

  if (!result) {
    throw new Error('Cannot find path to the TemplateRef');
  }
};
