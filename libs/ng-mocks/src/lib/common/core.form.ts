import * as module from '@angular/forms';

const AbstractControl = module.AbstractControl;
const DefaultValueAccessor = module.DefaultValueAccessor;
const FormControl = module.FormControl;
const FormControlDirective = module.FormControlDirective;
const NG_ASYNC_VALIDATORS = module.NG_ASYNC_VALIDATORS;
const NG_VALIDATORS = module.NG_VALIDATORS;
const NG_VALUE_ACCESSOR = module.NG_VALUE_ACCESSOR;
const NgControl = module.NgControl;
const NgModel = module.NgModel;
// Copy the namespace so bundlers do not require this Angular 22-only export.
const selectValueAccessor = ({ ...module } as any).ɵselectValueAccessor;

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
  selectValueAccessor,
};
