// tslint:disable variable-name

let AbstractControl: any | undefined;
let DefaultValueAccessor: any | undefined;
let FormControl: any | undefined;
let FormControlDirective: any | undefined;
let NG_ASYNC_VALIDATORS: any | undefined;
let NG_VALIDATORS: any | undefined;
let NG_VALUE_ACCESSOR: any | undefined;
let NgControl: any | undefined;
let NgModel: any | undefined;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/forms');
  // istanbul ignore else
  if (module) {
    AbstractControl = module.AbstractControl;
    DefaultValueAccessor = module.DefaultValueAccessor;
    FormControl = module.FormControl;
    FormControlDirective = module.FormControlDirective;
    NG_ASYNC_VALIDATORS = module.NG_ASYNC_VALIDATORS;
    NG_VALIDATORS = module.NG_VALIDATORS;
    NG_VALUE_ACCESSOR = module.NG_VALUE_ACCESSOR;
    NgControl = module.NgControl;
    NgModel = module.NgModel;
  }
} catch (e) {
  // nothing to do;
}

export default {
  AbstractControl,
  DefaultValueAccessor,
  FormControl,
  FormControlDirective,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
};
