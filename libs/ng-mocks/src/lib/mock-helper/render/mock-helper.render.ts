import funcFindDeep from './func.find-deep';
import funcParseTemplate from './func.parse-template';

export default (instance: object, param: object, $implicit?: any, variables?: Record<keyof any, any>) => {
  const template = funcParseTemplate(param);

  const result = funcFindDeep(
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
    throw new Error('Cannot find path to the TemplateRef');
  }
};
