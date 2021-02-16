import funcFindDeep from './func.find-deep';
import funcParseTemplate from './func.parse-template';

export default (instance: object, param?: object) => {
  const template = param ? funcParseTemplate(param) : undefined;

  let result = false;
  funcFindDeep(
    instance,
    tpl => {
      if (!template) {
        return true;
      }

      return tpl.elementRef.nativeElement === template.elementRef.nativeElement;
    },
    vcr => {
      vcr.clear();
      result = true;

      return false;
    },
  );

  if (!result) {
    throw new Error('Cannot find path to the TemplateRef');
  }
};
