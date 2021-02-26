// tslint:disable variable-name

let NG_ASYNC_VALIDATORS: any | undefined;
let NG_VALIDATORS: any | undefined;
let NG_VALUE_ACCESSOR: any | undefined;
let FormControlDirective: any | undefined;
let NgControl: any | undefined;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/forms');
  // istanbul ignore else
  if (module) {
    NG_ASYNC_VALIDATORS = module.NG_ASYNC_VALIDATORS;
    NG_VALIDATORS = module.NG_VALIDATORS;
    NG_VALUE_ACCESSOR = module.NG_VALUE_ACCESSOR;
    FormControlDirective = module.FormControlDirective;
    NgControl = module.NgControl;
  }
} catch (e) {
  // nothing to do;
}

export default {
  FormControlDirective,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
};
