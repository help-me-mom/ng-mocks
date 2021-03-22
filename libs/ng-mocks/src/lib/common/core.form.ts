// tslint:disable variable-name

let NG_ASYNC_VALIDATORS: any | undefined;
let NG_VALIDATORS: any | undefined;
let NG_VALUE_ACCESSOR: any | undefined;
let AbstractControl: any | undefined;
let FormControl: any | undefined;
let FormControlDirective: any | undefined;
let NgControl: any | undefined;
let NgModel: any | undefined;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/forms');
  // istanbul ignore else
  if (module) {
    NG_ASYNC_VALIDATORS = module.NG_ASYNC_VALIDATORS;
    NG_VALIDATORS = module.NG_VALIDATORS;
    NG_VALUE_ACCESSOR = module.NG_VALUE_ACCESSOR;
    AbstractControl = module.AbstractControl;
    FormControl = module.FormControl;
    FormControlDirective = module.FormControlDirective;
    NgControl = module.NgControl;
    NgModel = module.NgModel;
  }
} catch (e) {
  // nothing to do;
}

export default {
  AbstractControl,
  FormControl,
  FormControlDirective,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
};
